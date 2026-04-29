import React, {useState} from 'react';
import {
  View as RNView,
  Modal,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme} from '../theme';
import {Card, Text, Button, TouchableOpacity} from '../uikit';
import {MaterialCommunityIcons} from '@expo/vector-icons';

const PRESET_AMOUNTS = [500, 1000, 2000, 5000];

export default function AddMoneyModal({visible, onClose, onConfirm, isProcessing}) {
  const theme = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const styles = createStyles(theme);

  const handlePresetSelect = (value) => {
    setAmount(String(value));
    setSelectedPreset(value);
  };

  const handleCustomInput = (value) => {
    setAmount(value);
    setSelectedPreset(null);
  };

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || parsedAmount <= 0 || isNaN(parsedAmount)) {
      return;
    }
    onConfirm(parsedAmount);
  };

  const isValid = amount && parseFloat(amount) > 0 && !isNaN(parseFloat(amount));

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <RNView style={[styles.backdrop, {backgroundColor: theme.background}]}>
          {/* Header */}
          <RNView style={styles.header}>
            <TouchableOpacity onPress={onClose} disabled={isProcessing}>
              <MaterialCommunityIcons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text variant="h3">Add Money</Text>
            <RNView style={{width: 24}} />
          </RNView>

          {/* Content */}
          <RNView style={styles.content}>
            <Text variant="subtext" style={styles.label}>How much do you want to add?</Text>

            {/* Amount Input */}
            <RNView style={styles.inputSection}>
              <RNView style={styles.currencyPrefix}>
                <Text variant="h2" style={{color: theme.secondary}}>₹</Text>
              </RNView>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor={theme.textTertiary}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={handleCustomInput}
                editable={!isProcessing}
                maxLength={10}
              />
            </RNView>

            {/* Preset Amounts */}
            <Text variant="subtext" style={[styles.label, {marginTop: 20}]}>Quick amounts</Text>
            <RNView style={styles.presetGrid}>
              {PRESET_AMOUNTS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    selectedPreset === preset && styles.presetBtnActive,
                  ]}
                  onPress={() => handlePresetSelect(preset)}
                  disabled={isProcessing}
                >
                  <Text
                    variant="body"
                    style={[
                      styles.presetLabel,
                      selectedPreset === preset && styles.presetLabelActive,
                    ]}
                  >
                    ₹{preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </RNView>

            {/* Info Card */}
            <Card
              padding={12}
              style={{
                marginTop: 20,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <RNView style={{flexDirection: 'row', gap: 10}}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={theme.secondary}
                  style={{marginTop: 2}}
                />
                <Text variant="caption" style={{flex: 1, color: theme.textSecondary}}>
                  Your payment is secured by Razorpay's industry-leading encryption.
                </Text>
              </RNView>
            </Card>
          </RNView>

          {/* Actions */}
          <RNView style={styles.actions}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={onClose}
              disabled={isProcessing}
              style={{flex: 1}}
            />
            <RNView style={{width: 12}} />
            <Button
              label={isProcessing ? 'Processing...' : 'Add Money'}
              variant="primary"
              onPress={handleConfirm}
              disabled={!isValid || isProcessing}
              style={{flex: 1}}
            />
          </RNView>
        </RNView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {flex: 1},
  backdrop: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: `${theme.border}30`,
  },
  content: {
    flex: 1,
    padding: 22,
  },
  label: {
    color: theme.textSecondary,
    marginBottom: 14,
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 18,
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: `${theme.border}40`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  currencyPrefix: {
    paddingVertical: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: theme.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    paddingVertical: 18,
    paddingRight: 20,
    letterSpacing: 0.5,
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  presetBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: `${theme.border}30`,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  presetBtnActive: {
    backgroundColor: `${theme.secondary}15`,
    borderColor: theme.secondary,
    borderWidth: 2,
    shadowColor: theme.secondary,
    shadowOpacity: 0.25,
  },
  presetLabel: {
    color: theme.textSecondary,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  presetLabelActive: {
    color: theme.secondary,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    padding: 22,
    borderTopWidth: 1.5,
    borderTopColor: `${theme.border}30`,
    gap: 14,
  },
});
