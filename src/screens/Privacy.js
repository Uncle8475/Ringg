import React, {useEffect, useState} from 'react';
import {View as RNView, StyleSheet, ScrollView, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Card, Text} from '../uikit';

const STORAGE_KEY = 'privacySettings';

export default function Privacy() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [dataSharing, setDataSharing] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const settings = JSON.parse(saved);
          setDataSharing(settings.dataSharing);
        }
      } catch (e) {}
    })();
  }, []);

  const handleDataSharingChange = async (value) => {
    setDataSharing(value);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({dataSharing: value}));
  };

  return (
    <RNView style={[styles.container, {backgroundColor: theme.background}]}>
      <Header title="Privacy" />

      <ScrollView contentContainerStyle={{padding: 18, paddingBottom: 90}} showsVerticalScrollIndicator={false}>
        {/* Data Sharing Section */}
        <Text variant="label" style={styles.sectionTitle}>Data & Analytics</Text>
        
        <Card padding={16} style={{marginBottom: 12}}>
          <RNView style={styles.toggleRow}>
            <RNView style={{flex: 1}}>
              <Text variant="bodyStrong">Allow data sharing</Text>
            </RNView>
            <Switch
              value={dataSharing}
              onValueChange={handleDataSharingChange}
              trackColor={{false: 'rgba(255,255,255,0.25)', true: '#3DDC97'}}
              thumbColor="#FFFFFF"
            />
          </RNView>

          <Text variant="caption" style={[styles.description, {color: theme.textTertiary, marginTop: 12}]}>
            This helps us improve services and provide better experiences. Your data is processed securely and never shared with third parties.
          </Text>
        </Card>

        {/* Data Usage Info */}
        <Card padding={16} style={{marginBottom: 12, backgroundColor: 'rgba(109,94,246,0.08)', borderWidth: 1, borderColor: 'rgba(109,94,246,0.2)'}}>
          <Text variant="subtext" style={{color: theme.accent, marginBottom: 8}}>What we collect</Text>
          <Text variant="caption" style={{lineHeight: 20, color: theme.textSecondary}}>
            • Ring usage patterns{'\n'}
            • Transaction history{'\n'}
            • Device information{'\n'}
            • App interaction data
          </Text>
        </Card>

        <Card padding={16} style={{backgroundColor: 'rgba(109,94,246,0.08)', borderWidth: 1, borderColor: 'rgba(109,94,246,0.2)'}}>
          <Text variant="subtext" style={{color: theme.accent, marginBottom: 8}}>What we DON'T do</Text>
          <Text variant="caption" style={{lineHeight: 20, color: theme.textSecondary}}>
            • No location tracking{'\n'}
            • No third-party sharing{'\n'}
            • No selling your data{'\n'}
            • No behavioral profiling
          </Text>
        </Card>
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  sectionTitle: {marginBottom: 12, marginTop: 8},
  toggleRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  description: {lineHeight: 18},
});
