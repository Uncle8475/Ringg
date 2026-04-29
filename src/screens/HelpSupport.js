import React, { useState } from 'react';
import { View as RNView, StyleSheet, ScrollView, Linking, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import Header from '../components/Header';
import { Card, Text } from '../uikit';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HelpSupport() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 'f1',
      question: 'What is COSMIC ATTIRE Ring?',
      answer:
        'COSMIC ATTIRE Ring is a premium wearable device designed for secure payments, access control, and seamless integration with your daily life. It uses secure authentication and contactless technology.',
    },
    {
      id: 'f2',
      question: 'Is my data secure?',
      answer:
        'Yes. Your data is protected with bank-grade encryption and secure authentication. Payment details are never stored on the ring.',
    },
    {
      id: 'f3',
      question: 'What should I do if my ring stops working?',
      answer:
        'Try repairing the ring from the Ring page. If the issue continues, contact support for assistance or replacement.',
    },
    {
      id: 'f4',
      question: 'Does the ring have GPS tracking?',
      answer:
        'No. COSMIC ATTIRE Ring does not include GPS tracking. It focuses on secure access and payments without tracking location.',
    },
    {
      id: 'f5',
      question: 'If my ring is permanently blocked, what should I do?',
      answer:
        'If your ring is permanently blocked, there is no need to worry. For security reasons, permanently blocked rings cannot be unblocked from the app. Please contact our support team and we will help you verify and resolve the issue.',
    },
  ];

  const toggleFAQ = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => (prev === id ? null : id));
  };

  const openEmail = () => {
    Linking.openURL('mailto:attirecosmic@gmail.com');
  };

  const openPhone = () => {
    Linking.openURL('tel:+916392092199');
  };

  const styles = createStyles(theme);

  return (
    <RNView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title="Help & Support" />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <Text variant="label" style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        {faqs.map(faq => {
          const isOpen = expandedId === faq.id;

          return (
            <Card key={faq.id} style={styles.faqCard} padding={16}>
              <Pressable onPress={() => toggleFAQ(faq.id)}>
                <RNView style={styles.faqHeader}>
                  <Text variant="bodyStrong" style={styles.faqQuestion}>
                    {faq.question}
                  </Text>
                  <MaterialCommunityIcons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textMuted}
                  />
                </RNView>
              </Pressable>

              {isOpen && (
                <RNView style={styles.faqAnswerWrap}>
                  <Text variant="body" style={styles.faqAnswer}>
                    {faq.answer}
                  </Text>
                </RNView>
              )}
            </Card>
          );
        })}

        <RNView style={styles.contactSection}>
          <Text variant="label" style={styles.sectionTitle}>
            Contact Support
          </Text>

          {/* EMAIL */}
          <Card style={styles.contactCard} padding={16}>
            <RNView style={styles.contactIcon}>
              <MaterialCommunityIcons name="email" size={24} color={theme.textOnDark} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text variant="bodyStrong" style={styles.contactTitle}>
                Email
              </Text>
              <Pressable onPress={openEmail}>
                <Text variant="subtext" style={[styles.contactDetail, styles.linkText]}>
                  attirecosmic@gmail.com
                </Text>
              </Pressable>
            </RNView>
          </Card>

          {/* PHONE */}
          <Card style={styles.contactCard} padding={16}>
            <RNView style={styles.contactIcon}>
              <MaterialCommunityIcons name="phone" size={24} color={theme.textOnDark} />
            </RNView>
            <RNView style={{ flex: 1 }}>
              <Text variant="bodyStrong" style={styles.contactTitle}>
                Phone
              </Text>
              <Pressable onPress={openPhone}>
                <Text variant="subtext" style={[styles.contactDetail, styles.linkText]}>
                  +91 63920 92199
                </Text>
              </Pressable>
            </RNView>
          </Card>
        </RNView>
      </ScrollView>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, padding: 18 },
  content: { flex: 1 },
  sectionTitle: { marginBottom: 16, marginTop: 8 },

  faqCard: { marginBottom: 10 },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: { flex: 1 },
  faqAnswerWrap: { marginTop: 12 },
  faqAnswer: { opacity: 0.85, lineHeight: 20 },

  contactSection: { marginTop: 32 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactTitle: { fontSize: 16 },
  contactDetail: { fontSize: 14, marginTop: 2 },
  linkText: {
    color: theme.secondary,
    textDecorationLine: 'underline',
  },
});
