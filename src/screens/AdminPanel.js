import React, { useEffect, useState } from 'react';
import { View as RNView, StyleSheet, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import Header from '../components/Header';
import { Card, Text, Button, TouchableOpacity } from '../uikit';
import { useAuth } from '../lib/authContext';
import { getAllProfiles, updateProfileRole, deleteUserProfile } from '../lib/dbHelpers';

export default function AdminPanel() {
    const navigation = useNavigation();
    const theme = useTheme();
    const styles = createStyles(theme);
    const { user, profile } = useAuth(); // profile contains the role
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Golden Rule: Super Admin bypass check
    const isSuperAdmin = profile?.role === 'super_admin';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!isSuperAdmin) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const { profiles, error } = await getAllProfiles();
        if (error) {
            Alert.alert('Error', 'Failed to fetch users: ' + error);
        } else {
            setUsers(profiles || []);
        }
        setLoading(false);
    };

    const checkConnection = async () => {
        setLoading(true);
        Alert.alert('Unavailable', 'Supabase has been removed from this build.');
        setLoading(false);
    };

    const handleDemote = async (targetUser) => {
        updateRole(targetUser.user_id, 'user');
    };

    const handlePromoteToAdmin = async (targetUser) => {
        updateRole(targetUser.user_id, 'admin');
    };

    const handlePromoteToSuperAdmin = async (targetUser) => {
        updateRole(targetUser.user_id, 'super_admin');
    };

    const updateRole = async (targetId, newRole) => {
        setActionLoading(true);
        const { error } = await updateProfileRole(targetId, newRole);
        if (error) {
            Alert.alert('Error', 'Failed to update role');
        } else {
            Alert.alert('Success', `User role updated to ${newRole}`);
            fetchUsers();
        }
        setActionLoading(false);
    };

    const handleDelete = (targetUser) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete user ${targetUser.full_name || targetUser.email}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setActionLoading(true);
                        const { error } = await deleteUserProfile(targetUser.user_id);
                        if (error) {
                            Alert.alert('Error', 'Failed to delete user');
                        } else {
                            Alert.alert('Success', 'User deleted');
                            fetchUsers();
                        }
                        setActionLoading(false);
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }) => {
        const isSelf = item.user_id === user?.id;
        return (
            <Card padding={16} style={{ marginBottom: 12 }}>
                <RNView style={styles.userHeader}>
                    <RNView>
                        <Text variant="bodyStrong">{item.full_name || 'No Name'}</Text>
                        <Text variant="caption">{item.email}</Text>
                        <RNView style={[styles.badge, styles.badgeRole(item.role)]}>
                            <Text style={styles.badgeText}>{item.role || 'user'}</Text>
                        </RNView>
                    </RNView>
                    {isSuperAdmin && !isSelf && (
                        <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.accent} />
                        </TouchableOpacity>
                    )}
                </RNView>

                {isSuperAdmin && !isSelf && (
                    <RNView style={styles.actionsRow}>
                        {item.role !== 'admin' && item.role !== 'super_admin' && (
                            <Button
                                label="Make Admin"
                                onPress={() => handlePromoteToAdmin(item)}
                                variant="secondary"
                                style={styles.actionBtn}
                            />
                        )}
                        {item.role === 'admin' && (
                            <Button
                                label="Demote"
                                onPress={() => handleDemote(item)}
                                variant="secondary"
                                style={styles.actionBtn}
                            />
                        )}
                        {item.role !== 'super_admin' && (
                            <Button
                                label="Make Super Admin"
                                onPress={() => handlePromoteToSuperAdmin(item)}
                                variant="primary"
                                style={styles.actionBtn}
                            />
                        )}
                    </RNView>
                )}
            </Card>
        );
    };

    if (!isSuperAdmin) {
        return (
            <RNView style={[styles.container, { backgroundColor: theme.background }]}>
                <Header title="Admin Panel" />
                <RNView style={styles.center}>
                    <Text variant="h3" style={{ color: theme.error }}>Access Denied</Text>
                    <Text variant="body" style={{ marginTop: 8 }}>You do not have permission to view this page.</Text>
                </RNView>
            </RNView>
        );
    }

    return (
        <RNView style={[styles.container, { backgroundColor: theme.background }]}>
            <Header title="Admin Panel" />
            {loading ? (
                <RNView style={styles.center}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </RNView>
            ) : (
                <FlatList
                    contentContainerStyle={{ padding: 18, paddingBottom: 50 }}
                    data={users}
                    keyExtractor={(item) => item.user_id}
                    renderItem={renderUserItem}
                    ListHeaderComponent={() => (
                        <RNView style={{ marginBottom: 16 }}>
                            <Text variant="h2">User Management</Text>
                            <Text variant="subtext" style={{ marginTop: 4 }}>Manage roles and permissions</Text>
                            <Button
                                label="Check DB Connection"
                                onPress={checkConnection}
                                variant="secondary"
                                style={{ marginTop: 12 }}
                            />
                        </RNView>
                    )}
                    ListEmptyComponent={<Text>No users found</Text>}
                />
            )}
            {actionLoading && (
                <RNView style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.textPrimary} />
                </RNView>
            )}
        </RNView>
    );
}

const createStyles = (theme) => {
    const styles = StyleSheet.create({
        container: { flex: 1 },
        center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
        userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
        badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
        badgeText: { fontSize: 10, fontWeight: '700', color: theme.textOnDark, textTransform: 'uppercase' },
        deleteBtn: { padding: 8 },
        actionsRow: { flexDirection: 'row', marginTop: 12, gap: 8, flexWrap: 'wrap' },
        actionBtn: { paddingVertical: 8, paddingHorizontal: 12, minWidth: 100 },
        loadingOverlay: {
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: theme.overlay, alignItems: 'center', justifyContent: 'center'
        }
    });

    return {
        ...styles,
        badgeRole: (role) => ({
            backgroundColor: role === 'super_admin' ? theme.accent : role === 'admin' ? theme.secondary : theme.card
        })
    };
};
