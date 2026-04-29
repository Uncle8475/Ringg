import React, { useCallback, useMemo, useState } from 'react';
import {
  View as RNView,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  TextInput,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../components/Header';
import { useTheme } from '../theme';
import { Card, Text, Button, TouchableOpacity } from '../uikit';
import resumeService from '../services/resumeService';

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['pdf', 'docx'];
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const RESUME_CATEGORIES = [
  { key: 'Business', label: 'Business', subtitle: 'Strategy, finance, operations.' },
  { key: 'Technical', label: 'Technical', subtitle: 'Engineering, product, data.' },
  { key: 'Marketing', label: 'Marketing', subtitle: 'Growth, brand, campaigns.' },
  { key: 'Design', label: 'Design', subtitle: 'UI/UX, visual, product design.' },
];

const STATUS_OPTIONS = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected', 'On Hold'];

const RESUME_TYPE_OVERVIEW = [
  { key: 'Creative', accent: 'info' },
  { key: 'Executive', accent: 'primary' },
  { key: 'ATS Optimized', accent: 'secondary' },
  { key: 'Standard', accent: 'textSecondary' },
];

const RESUME_TYPE_MAP = {
  Business: 'Executive',
  Technical: 'ATS Optimized',
  Marketing: 'Creative',
  Design: 'Standard',
};

const getFileExtension = (fileName = '') => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
};

const getDisplayFileType = (fileType = '') => {
  if (!fileType) return 'UNKNOWN';
  if (fileType.includes('/')) {
    const [, subtype] = fileType.split('/');
    return (subtype || fileType).toUpperCase();
  }
  return fileType.toUpperCase();
};

const formatDateTime = (value) => {
  if (!value) return '--';
  return new Date(value).toLocaleString();
};

const buildAnalytics = (applications = []) => {
  const totals = {
    total: applications.length,
    shortlisted: 0,
    rejected: 0,
    interview: 0,
  };

  applications.forEach((app) => {
    const status = (app.status || '').toLowerCase();
    if (status.includes('shortlisted')) totals.shortlisted += 1;
    if (status.includes('rejected')) totals.rejected += 1;
    if (status.includes('interview')) totals.interview += 1;
  });

  return totals;
};

const mapResumeType = (resumeType) => RESUME_TYPE_MAP[resumeType] || 'Standard';

const normalizeStatus = (status = '') => {
  const normalized = status.toLowerCase();
  if (normalized.includes('shortlisted')) return 'Shortlisted';
  if (normalized.includes('rejected')) return 'Rejected';
  return 'In Review';
};

const summarizeStatuses = (applications = []) => {
  const summary = { shortlisted: 0, rejected: 0, inReview: 0 };

  applications.forEach((app) => {
    const normalized = normalizeStatus(app.status);
    if (normalized === 'Shortlisted') summary.shortlisted += 1;
    else if (normalized === 'Rejected') summary.rejected += 1;
    else summary.inReview += 1;
  });

  return summary;
};

const formatStatusSummary = (summary) => (
  `Shortlisted ${summary.shortlisted} • In Review ${summary.inReview} • Rejected ${summary.rejected}`
);

const clampValue = (value, min, max) => Math.min(max, Math.max(min, value));

const calculateAtsScore = (applications = []) => {
  if (!applications.length) return 58;

  const summary = summarizeStatuses(applications);
  const positiveSignal = summary.shortlisted * 8;
  const riskSignal = summary.rejected * 6;
  const reviewSignal = summary.inReview * 2;
  const base = 62 + positiveSignal + reviewSignal - riskSignal;

  return clampValue(Math.round(base), 40, 98);
};

export default function ESummitScreen() {
  const theme = useTheme();
  const route = useRoute();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isAdminView = route?.params?.isAdminView !== undefined
    ? Boolean(route.params.isAdminView)
    : true;
  const [loading, setLoading] = useState(true);
  const [uploadingByCategory, setUploadingByCategory] = useState({});
  const [resumesByCategory, setResumesByCategory] = useState({});
  const [applicationsByResume, setApplicationsByResume] = useState({});
  const [draftsByResume, setDraftsByResume] = useState({});
  const [allApplications, setAllApplications] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    shortlisted: 0,
    rejected: 0,
    interview: 0,
  });

  const chartData = useMemo(() => ([
    { key: 'Applied', value: analytics.total, color: theme.colors.primary },
    { key: 'Shortlisted', value: analytics.shortlisted, color: theme.colors.info },
    { key: 'Rejected', value: analytics.rejected, color: theme.colors.accent },
    { key: 'Interview', value: analytics.interview, color: theme.colors.textPrimary },
  ]), [analytics, theme.colors.accent, theme.colors.info, theme.colors.primary, theme.colors.textPrimary]);

  const maxChartValue = Math.max(1, ...chartData.map((item) => item.value));

  const allResumes = useMemo(
    () => Object.values(resumesByCategory).flat(),
    [resumesByCategory]
  );

  const resumeById = useMemo(() => {
    const entries = allResumes.map((resume) => [resume.id, resume]);
    return Object.fromEntries(entries);
  }, [allResumes]);

  const resumeTypeCounts = useMemo(() => {
    const counts = RESUME_TYPE_OVERVIEW.reduce((acc, item) => {
      acc[item.key] = 0;
      return acc;
    }, {});

    allResumes.forEach((resume) => {
      const mappedType = mapResumeType(resume.resume_type);
      counts[mappedType] = (counts[mappedType] || 0) + 1;
    });

    return counts;
  }, [allResumes]);

  const jobTitleStats = useMemo(() => {
    const tally = {};
    allApplications.forEach((app) => {
      const title = app.role?.trim();
      if (!title) return;
      tally[title] = (tally[title] || 0) + 1;
    });

    const rows = Object.entries(tally)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const max = Math.max(1, ...rows.map((row) => row.count));
    return { rows, max };
  }, [allApplications]);

  const loadResumes = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!silent) setLoading(true);
    try {
      const categoryData = await Promise.all(
        RESUME_CATEGORIES.map(async (category) => {
          const resumes = await resumeService.listResumes(category.key);
          return { key: category.key, resumes };
        })
      );

      const nextResumes = {};
      categoryData.forEach(({ key, resumes }) => {
        nextResumes[key] = resumes;
      });

      const resumeIds = categoryData.flatMap(({ resumes }) => resumes.map((resume) => resume.id));
      const nextApplications = {};

      await Promise.all(
        resumeIds.map(async (resumeId) => {
          const apps = await resumeService.listApplications(resumeId);
          nextApplications[resumeId] = apps;
        })
      );

      const latestApplications = await resumeService.listAllApplications();
      setAnalytics(buildAnalytics(latestApplications));
      setAllApplications(latestApplications);

      setResumesByCategory(nextResumes);
      setApplicationsByResume(nextApplications);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to load resumes.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadResumes();
      const interval = setInterval(() => {
        loadResumes({ silent: true });
      }, 20000);

      return () => clearInterval(interval);
    }, [loadResumes])
  );

  const validateFile = (file) => {
    const extension = getFileExtension(file?.name);
    const mimeType = file?.mimeType || file?.type || '';

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return 'Only PDF or DOCX files are allowed.';
    }

    if (mimeType && !ALLOWED_MIME_TYPES.includes(mimeType)) {
      return 'Only PDF or DOCX files are allowed.';
    }

    if (typeof file?.size === 'number' && file.size > MAX_SIZE_BYTES) {
      return 'File size must be 5 MB or less.';
    }

    return null;
  };

  const handlePickResumes = async (categoryKey) => {
    if (uploadingByCategory[categoryKey]) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_MIME_TYPES,
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const files = result.assets || [];
      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        const validationError = validateFile(file);
        if (validationError) {
          errors.push(`${file.name || 'File'}: ${validationError}`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length) {
        Alert.alert('Some files were skipped', errors.slice(0, 3).join('\n'));
      }

      if (!validFiles.length) {
        return;
      }

      setUploadingByCategory((prev) => ({ ...prev, [categoryKey]: true }));

      for (const file of validFiles) {
        await resumeService.uploadResume(categoryKey, file);
      }

      Alert.alert('Success', `${validFiles.length} resume(s) uploaded.`);
      await loadResumes();
    } catch (error) {
      Alert.alert('Upload Failed', error.message || 'Failed to upload resume(s).');
    } finally {
      setUploadingByCategory((prev) => ({ ...prev, [categoryKey]: false }));
    }
  };

  const handleOpenResume = async (resume) => {
    const publicUrl = resumeService.getPublicResumeUrl(resume.file_path);

    if (!publicUrl) {
      Alert.alert('Unavailable', 'Public resume link is not available yet.');
      return;
    }

    const canOpen = await Linking.canOpenURL(publicUrl);
    if (!canOpen) {
      Alert.alert('Error', 'Unable to open the resume link.');
      return;
    }

    await Linking.openURL(publicUrl);
  };

  const handleDeleteResume = (resume) => {
    Alert.alert('Delete Resume', 'Remove this resume and all its applications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await resumeService.deleteResume(resume.id, resume.file_path);
            await loadResumes();
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to delete resume.');
          }
        }
      }
    ]);
  };

  const updateDraft = (resumeId, updates) => {
    setDraftsByResume((prev) => ({
      ...prev,
      [resumeId]: { ...(prev[resumeId] || {}), ...updates },
    }));
  };

  const handleAddApplication = async (resumeId) => {
    const draft = draftsByResume[resumeId] || {};

    if (!draft.companyName || !draft.role || !draft.status) {
      Alert.alert('Missing Details', 'Add company, role, and status.');
      return;
    }

    try {
      const newApplication = await resumeService.addApplication({
        resumeId,
        companyName: draft.companyName.trim(),
        role: draft.role.trim(),
        status: draft.status,
        notes: draft.notes?.trim() || null,
      });

      setApplicationsByResume((prev) => ({
        ...prev,
        [resumeId]: [newApplication, ...(prev[resumeId] || [])],
      }));

      setDraftsByResume((prev) => ({
        ...prev,
        [resumeId]: { companyName: '', role: '', status: '', notes: '' },
      }));

      await loadResumes({ silent: true });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add application.');
    }
  };

  const handleUpdateApplicationStatus = (application) => {
    Alert.alert('Update Status', 'Select the new status for this application.',
      STATUS_OPTIONS.map((status) => ({
        text: status,
        onPress: async () => {
          try {
            const updated = await resumeService.updateApplicationStatus(application.id, status);
            setApplicationsByResume((prev) => {
              const entries = Object.entries(prev).map(([resumeId, apps]) => {
                const nextApps = apps.map((app) => (app.id === updated.id ? updated : app));
                return [resumeId, nextApps];
              });
              return Object.fromEntries(entries);
            });
            await loadResumes({ silent: true });
          } catch (error) {
            Alert.alert('Error', error.message || 'Failed to update status.');
          }
        }
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const renderApplications = (resumeId) => {
    const applications = applicationsByResume[resumeId] || [];

    if (!applications.length) {
      return <Text variant="caption" style={styles.emptyApplications}>No applications yet.</Text>;
    }

    return applications.map((app) => {
      const statusLabel = normalizeStatus(app.status);
      return (
        <RNView key={app.id} style={styles.applicationRow}>
          <RNView style={styles.applicationHeader}>
            <Text variant="bodyStrong" style={styles.applicationCompany}>{app.company_name}</Text>
            <TouchableOpacity
              onPress={() => handleUpdateApplicationStatus(app)}
              style={[
                styles.statusBadge,
                statusLabel === 'Shortlisted' && styles.statusBadgeShortlisted,
                statusLabel === 'In Review' && styles.statusBadgeNeutral,
                statusLabel === 'Rejected' && styles.statusBadgeWarning,
              ]}
            >
              <Text variant="caption" style={styles.statusBadgeText}>{statusLabel}</Text>
            </TouchableOpacity>
          </RNView>
          <Text variant="subtext" style={styles.applicationRole}>{app.role}</Text>
          {app.notes ? (
            <Text variant="caption" style={styles.applicationNotes}>{app.notes}</Text>
          ) : null}
          <Text variant="caption" style={styles.applicationDate}>{formatDateTime(app.created_at)}</Text>
        </RNView>
      );
    });
  };

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="E-Summit" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <RNView style={styles.analyticsSection}>
          <Text variant="label" style={styles.analyticsTitle}>Resume Analytics</Text>
          <RNView style={styles.analyticsGrid}>
            <Card padding={12} style={styles.analyticsCard}>
              <Text variant="caption" style={styles.analyticsLabel}>Total Applied</Text>
              <Text variant="h2" style={styles.analyticsValue}>{analytics.total}</Text>
            </Card>
            <Card padding={12} style={styles.analyticsCard}>
              <Text variant="caption" style={styles.analyticsLabel}>Shortlisted</Text>
              <Text variant="h2" style={styles.analyticsValue}>{analytics.shortlisted}</Text>
            </Card>
            <Card padding={12} style={styles.analyticsCard}>
              <Text variant="caption" style={styles.analyticsLabel}>Rejected</Text>
              <Text variant="h2" style={styles.analyticsValue}>{analytics.rejected}</Text>
            </Card>
            <Card padding={12} style={styles.analyticsCard}>
              <Text variant="caption" style={styles.analyticsLabel}>Interview</Text>
              <Text variant="h2" style={styles.analyticsValue}>{analytics.interview}</Text>
            </Card>
          </RNView>

          {analytics.total === 0 ? (
            <Text variant="caption" style={styles.emptyAnalytics}>No applications yet</Text>
          ) : (
            <Card padding={16} style={styles.chartCard}>
              <RNView style={styles.chartRow}>
                {chartData.map((item) => (
                  <RNView key={item.key} style={styles.chartItem}>
                    <RNView
                      style={[
                        styles.chartBar,
                        {
                          height: Math.max(6, (item.value / maxChartValue) * 72),
                          backgroundColor: item.color,
                        }
                      ]}
                    />
                    <Text variant="caption" style={styles.chartLabel}>{item.key}</Text>
                    <Text variant="caption" style={styles.chartValue}>{item.value}</Text>
                  </RNView>
                ))}
              </RNView>
            </Card>
          )}
        </RNView>

        <RNView style={styles.dashboardSection}>
          <Text variant="label" style={styles.sectionTitle}>Resume Type Overview</Text>
          <Card padding={18} style={styles.dashboardCard}>
            <RNView style={styles.overviewGrid}>
              {RESUME_TYPE_OVERVIEW.map((item) => {
                const accent = item.accent === 'info'
                  ? theme.colors.info
                  : (theme[item.accent] || theme.textSecondary);
                const count = resumeTypeCounts[item.key] || 0;
                return (
                  <RNView key={item.key} style={styles.overviewItem}>
                    <RNView style={[styles.donut, { borderColor: accent }]}>
                      <RNView style={styles.donutInner}>
                        <Text variant="bodyStrong" style={styles.donutValue}>{count}</Text>
                      </RNView>
                    </RNView>
                    <RNView style={styles.overviewText}>
                      <Text variant="bodyStrong">{item.key}</Text>
                      <Text variant="caption" style={styles.overviewSubtext}>{count} resumes</Text>
                    </RNView>
                  </RNView>
                );
              })}
            </RNView>
          </Card>
        </RNView>

        <RNView style={styles.dashboardSection}>
          <Text variant="label" style={styles.sectionTitle}>Applications by Job Title</Text>
          <Card padding={18} style={styles.dashboardCard}>
            {jobTitleStats.rows.length === 0 ? (
              <Text variant="caption" style={styles.emptyAnalytics}>No applications yet</Text>
            ) : (
              jobTitleStats.rows.map((row) => (
                <RNView key={row.title} style={styles.jobRow}>
                  <RNView style={styles.jobRowHeader}>
                    <Text variant="bodyStrong" numberOfLines={1} style={styles.jobTitle}>{row.title}</Text>
                    <Text variant="caption" style={styles.jobCount}>{row.count}</Text>
                  </RNView>
                  <RNView style={styles.jobBarTrack}>
                    <RNView
                      style={[
                        styles.jobBarFill,
                        { width: `${(row.count / jobTitleStats.max) * 100}%` },
                      ]}
                    />
                  </RNView>
                </RNView>
              ))
            )}
          </Card>
        </RNView>

        <RNView style={styles.dashboardSection}>
          <Text variant="label" style={styles.sectionTitle}>Resume Applications</Text>
          <Card padding={16} style={styles.dashboardCard}>
            <RNView style={styles.tableHeader}>
              {isAdminView ? (
                <Text variant="caption" style={[styles.tableHeaderText, styles.tableCellUser]}>User</Text>
              ) : null}
              <Text variant="caption" style={[styles.tableHeaderText, styles.tableCellTitle]}>Job Title</Text>
              <Text variant="caption" style={[styles.tableHeaderText, styles.tableCellType]}>Resume Type</Text>
              <Text variant="caption" style={[styles.tableHeaderText, styles.tableCellScore]}>ATS Score</Text>
              <Text variant="caption" style={[styles.tableHeaderText, styles.tableCellStatus]}>Status</Text>
            </RNView>

            {allApplications.length === 0 ? (
              <Text variant="caption" style={styles.emptyApplications}>No applications yet.</Text>
            ) : (
              allApplications.slice(0, 10).map((app) => {
                const resume = resumeById[app.resume_id];
                const resumeApps = applicationsByResume[app.resume_id] || [];
                const atsScore = calculateAtsScore(resumeApps);
                const resumeType = resume ? mapResumeType(resume.resume_type) : 'Standard';
                const statusLabel = normalizeStatus(app.status);

                return (
                  <RNView key={app.id} style={styles.tableRow}>
                    {isAdminView ? (
                      <Text variant="caption" numberOfLines={1} style={[styles.tableCellText, styles.tableCellUser]}>
                        {app.user_id?.slice(0, 8) || '—'}
                      </Text>
                    ) : null}
                    <Text variant="subtext" numberOfLines={1} style={[styles.tableCellText, styles.tableCellTitle]}>
                      {app.role || '—'}
                    </Text>
                    <Text variant="subtext" numberOfLines={1} style={[styles.tableCellText, styles.tableCellType]}>
                      {resumeType}
                    </Text>
                    <RNView style={[styles.atsBadge, styles.atsBadgeCompact, styles.tableCellScore, atsScore > 85 && styles.atsBadgePremium, atsScore < 60 && styles.atsBadgeWarning, atsScore >= 60 && atsScore <= 85 && styles.atsBadgeNeutral]}>
                      <Text variant="caption" style={styles.atsBadgeTextCompact}>{atsScore}</Text>
                    </RNView>
                    <RNView
                      style={[
                        styles.statusBadge,
                        styles.tableCellStatus,
                        statusLabel === 'Shortlisted' && styles.statusBadgeShortlisted,
                        statusLabel === 'In Review' && styles.statusBadgeNeutral,
                        statusLabel === 'Rejected' && styles.statusBadgeWarning,
                      ]}
                    >
                      <Text variant="caption" style={styles.statusBadgeText}>{statusLabel}</Text>
                    </RNView>
                  </RNView>
                );
              })
            )}
          </Card>
        </RNView>

        <Text variant="body" style={styles.description}>
          Upload resumes by category for E-Summit shortlisting and track every application.
        </Text>

        {loading ? (
          <RNView style={styles.loadingRow}>
            <ActivityIndicator size="small" color={theme.accent} />
            <Text variant="subtext" style={styles.loadingText}>Loading resumes...</Text>
          </RNView>
        ) : null}

        {RESUME_CATEGORIES.map((category) => {
          const resumes = resumesByCategory[category.key] || [];
          const uploading = uploadingByCategory[category.key];

          return (
            <RNView key={category.key} style={styles.categorySection}>
              <Card padding={16} style={styles.categoryCard}>
                <RNView style={styles.categoryHeader}>
                  <Text variant="h3" style={styles.categoryTitle}>{category.label}</Text>
                  <Text variant="subtext" style={styles.categorySubtitle}>{category.subtitle}</Text>
                </RNView>
                <RNView style={styles.categoryMeta}>
                  <Text variant="caption" style={styles.categoryMetaText}>PDF or DOCX. Max 5 MB each.</Text>
                </RNView>
                <Button
                  label={`Upload ${category.label} Resume`}
                  onPress={() => handlePickResumes(category.key)}
                  style={[styles.uploadButton, uploading && { opacity: 0.6 }]}
                  disabled={uploading}
                />
                {uploading ? (
                  <RNView style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={theme.accent} />
                    <Text variant="subtext" style={styles.loadingText}>Uploading...</Text>
                  </RNView>
                ) : null}
              </Card>

              {resumes.length === 0 ? (
                <Card padding={16} style={styles.emptyCard}>
                  <Text variant="subtext">No resumes uploaded for this category.</Text>
                </Card>
              ) : (
                resumes.map((resume) => (
                  <Card key={resume.id} padding={16} style={styles.resumeCard}>
                    <RNView style={styles.resumeHeader}>
                      <RNView style={styles.resumeHeaderLeft}>
                        <Text variant="bodyStrong" style={styles.resumeTitle}>{resume.file_name}</Text>
                        <Text variant="caption" style={styles.resumeType}>{mapResumeType(resume.resume_type)}</Text>
                      </RNView>
                      {(() => {
                        const resumeApps = applicationsByResume[resume.id] || [];
                        const atsScore = calculateAtsScore(resumeApps);
                        return (
                          <RNView
                            style={[
                              styles.atsBadge,
                              atsScore > 85 && styles.atsBadgePremium,
                              atsScore < 60 && styles.atsBadgeWarning,
                              atsScore >= 60 && atsScore <= 85 && styles.atsBadgeNeutral,
                            ]}
                          >
                            <Text variant="caption" style={styles.atsBadgeText}>{atsScore}</Text>
                            <Text variant="caption" style={styles.atsBadgeLabel}>ATS</Text>
                          </RNView>
                        );
                      })()}
                    </RNView>

                    <RNView style={styles.metaRow}>
                      <Text variant="subtext">Total Applications</Text>
                      <Text style={styles.metaValue}>{applicationsByResume[resume.id]?.length || 0}</Text>
                    </RNView>
                    <RNView style={styles.metaRow}>
                      <Text variant="subtext">Status Summary</Text>
                      <Text style={styles.metaValue}>
                        {formatStatusSummary(summarizeStatuses(applicationsByResume[resume.id] || []))}
                      </Text>
                    </RNView>
                    <RNView style={styles.metaRow}>
                      <Text variant="subtext">File Type</Text>
                      <Text style={styles.metaValue}>{getDisplayFileType(resume.file_type)}</Text>
                    </RNView>
                    <RNView style={styles.metaRow}>
                      <Text variant="subtext">Uploaded</Text>
                      <Text style={styles.metaValue}>{formatDateTime(resume.created_at)}</Text>
                    </RNView>

                    <RNView style={styles.actionRow}>
                      <Button
                        label="View"
                        onPress={() => handleOpenResume(resume)}
                        style={styles.actionButton}
                      />
                      <Button
                        label="Delete"
                        variant="secondary"
                        onPress={() => handleDeleteResume(resume)}
                        style={styles.actionButton}
                      />
                    </RNView>

                    <RNView style={styles.trackerSection}>
                      <Text variant="bodyStrong" style={styles.trackerTitle}>Apply Tracker</Text>
                      <TextInput
                        placeholder="Company name"
                        placeholderTextColor={theme.textSecondary}
                        value={draftsByResume[resume.id]?.companyName || ''}
                        onChangeText={(value) => updateDraft(resume.id, { companyName: value })}
                        style={styles.input}
                      />
                      <TextInput
                        placeholder="Role"
                        placeholderTextColor={theme.textSecondary}
                        value={draftsByResume[resume.id]?.role || ''}
                        onChangeText={(value) => updateDraft(resume.id, { role: value })}
                        style={styles.input}
                      />
                      <RNView style={styles.statusRow}>
                        {STATUS_OPTIONS.map((status) => {
                          const active = draftsByResume[resume.id]?.status === status;
                          return (
                            <TouchableOpacity
                              key={status}
                              onPress={() => updateDraft(resume.id, { status })}
                              style={[styles.statusPill, active && styles.statusPillActive]}
                            >
                              <Text
                                variant="caption"
                                style={[styles.statusText, active && styles.statusTextActive]}
                              >
                                {status}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </RNView>
                      <TextInput
                        placeholder="Notes (optional)"
                        placeholderTextColor={theme.textSecondary}
                        value={draftsByResume[resume.id]?.notes || ''}
                        onChangeText={(value) => updateDraft(resume.id, { notes: value })}
                        style={[styles.input, styles.notesInput]}
                        multiline
                      />
                      <Button
                        label="Add Application"
                        onPress={() => handleAddApplication(resume.id)}
                        style={styles.addApplicationButton}
                      />
                    </RNView>

                    <RNView style={styles.applicationsSection}>
                      <Text variant="bodyStrong" style={styles.trackerTitle}>Applications</Text>
                      {renderApplications(resume.id)}
                    </RNView>
                  </Card>
                ))
              )}
            </RNView>
          );
        })}
      </ScrollView>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 18 },
  content: { paddingBottom: 90 },
  analyticsSection: { marginBottom: 18 },
  analyticsTitle: { marginBottom: 12 },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  analyticsCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${theme.border}30`,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  analyticsLabel: { color: theme.textSecondary, marginBottom: 6 },
  analyticsValue: { color: theme.textPrimary },
  emptyAnalytics: { marginTop: 10, color: theme.textSecondary },
  chartCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${theme.border}30`,
  },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartItem: { alignItems: 'center', flex: 1 },
  chartBar: {
    width: 26,
    borderRadius: 10,
    marginBottom: 8,
  },
  chartLabel: { color: theme.textSecondary },
  chartValue: { color: theme.textMuted },
  dashboardSection: { marginBottom: 18 },
  sectionTitle: { marginBottom: 10 },
  dashboardCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${theme.border}30`,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  overviewGrid: { gap: 14 },
  overviewItem: { flexDirection: 'row', alignItems: 'center' },
  donut: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: theme.card,
  },
  donutInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  donutValue: { color: theme.textPrimary },
  overviewText: { flex: 1 },
  overviewSubtext: { color: theme.textSecondary, marginTop: 2 },
  jobRow: { marginBottom: 12 },
  jobRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  jobTitle: { flex: 1, marginRight: 8 },
  jobCount: { color: theme.textSecondary },
  jobBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: `${theme.border}30`,
    overflow: 'hidden',
  },
  jobBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.border}30`,
  },
  tableHeaderText: { color: theme.textSecondary },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${theme.border}15`,
  },
  tableCellText: { color: theme.textSecondary },
  tableCellUser: { flex: 0.9 },
  tableCellTitle: { flex: 1.4 },
  tableCellType: { flex: 1.1 },
  tableCellScore: { flex: 0.6 },
  tableCellStatus: { flex: 0.9 },
  description: { marginBottom: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  loadingText: { marginLeft: 8 },
  categorySection: { marginBottom: 18 },
  categoryCard: { marginBottom: 14 },
  categoryHeader: { marginBottom: 8 },
  categoryTitle: { marginBottom: 4 },
  categorySubtitle: { color: theme.textSecondary },
  categoryMeta: { marginBottom: 12 },
  categoryMetaText: { color: theme.textSecondary },
  uploadButton: { marginTop: 6 },
  emptyCard: { marginBottom: 16 },
  resumeCard: { marginBottom: 16 },
  resumeHeader: { marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between' },
  resumeHeaderLeft: { flex: 1, marginRight: 12 },
  resumeTitle: { marginBottom: 4 },
  resumeType: { color: theme.textSecondary },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaValue: { maxWidth: '60%', textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 14 },
  actionButton: { flex: 1 },
  trackerSection: { marginTop: 8 },
  trackerTitle: { marginBottom: 10 },
  input: {
    backgroundColor: theme.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: theme.textPrimary,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: 14,
    marginBottom: 10,
  },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  statusPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  statusPillActive: { borderColor: theme.secondary, backgroundColor: theme.card },
  statusText: { color: theme.textSecondary },
  statusTextActive: { color: theme.secondary },
  addApplicationButton: { marginTop: 4 },
  applicationsSection: { marginTop: 16 },
  emptyApplications: { marginTop: 4, color: theme.textSecondary },
  applicationRow: {
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    marginTop: 10,
  },
  applicationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  applicationCompany: { flex: 1, marginRight: 8 },
  atsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: `${theme.border}40`,
    backgroundColor: theme.card,
  },
  atsBadgeCompact: {
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginLeft: 6,
  },
  atsBadgePremium: { borderColor: theme.primary },
  atsBadgeNeutral: { borderColor: theme.textSecondary },
  atsBadgeWarning: { borderColor: theme.accent },
  atsBadgeText: { color: theme.textPrimary, marginRight: 6 },
  atsBadgeTextCompact: { color: theme.textPrimary, marginRight: 0 },
  atsBadgeLabel: { color: theme.textSecondary },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: `${theme.border}40`,
    backgroundColor: theme.card,
  },
  statusBadgeShortlisted: { borderColor: theme.primary },
  statusBadgeNeutral: { borderColor: theme.textSecondary },
  statusBadgeWarning: { borderColor: theme.accent },
  statusBadgeText: { color: theme.textSecondary },
  applicationRole: { marginTop: 4 },
  applicationNotes: { marginTop: 6, color: theme.textSecondary },
  applicationDate: { marginTop: 6, color: theme.textMuted },
});
