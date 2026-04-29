import React, {useEffect, useState, useRef} from 'react';
import {View as RNView, StyleSheet, Alert, Image, ScrollView, Animated, Easing, AccessibilityInfo} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useTheme} from '../theme';
import Header from '../components/Header';
import {Card, Text, TouchableOpacity, Button} from '../uikit';
import {restartSetup} from '../utils/setupManager';

export default function RingPage(){
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const onSetupRestart = route.params?.onSetupRestart;
  
  const ring = {name:'COSMIC Ring', id:'CR-00123', linked:'pranjal@cosmic', lastSync:'9:12 AM', status:'Active'};
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('9:12 AM');
  const orbitValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(()=>{
    // Ring page no longer manages security settings
  },[]);

  // Handle ring repair
  const handleRepairRing = async () => {
    Alert.alert(
      'Re-pair Your Ring?',
      'Re-pairing will reset your ring setup completely. You will need to go through the entire setup process again.\n\nYour ring configuration, profile data, and personalization will be cleared.\n\nContinue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            // User cancelled, do nothing
          }
        },
        {
          text: 'Confirm Re-pair',
          style: 'destructive',
          onPress: async () => {
            setIsRepairing(true);
            try {
              // Use the restart function passed from App.js
              if (onSetupRestart) {
                await onSetupRestart();
                // Successfully restarted - App.js will handle redirect to WelcomeScreen
              } else {
                // Fallback: directly restart setup if function not available
                await restartSetup();
                // Force app to reload by navigating to a dummy screen and back
                // This ensures the App.js re-evaluates the setup state
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }
            } catch (error) {
              console.error('Error restarting setup:', error);
              Alert.alert('Error', 'Failed to restart setup. Please try again.');
              setIsRepairing(false);
            }
          }
        }
      ],
      { cancelable: false } // Prevent dismissing by tapping outside
    );
  };

  // Handle ring sync
  const handleSyncRing = async () => {
    setIsSyncing(true);
    // Simulate sync pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.08,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Simulate sync process (2.5 seconds)
    setTimeout(() => {
      setIsSyncing(false);
      pulseValue.setValue(1);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit', hour12:true});
      setLastSyncTime('Synced just now');
      Alert.alert('Success', 'Ring synced successfully');
    }, 2500);
  };

  // Start ring orbit animation (revolving motion)
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(orbitValue, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [orbitValue]);

  // Orbit path calculations
  const orbitRadius = 60;
  const translateX = orbitValue.interpolate({
    inputRange: [0, 1],
    outputRange: [orbitRadius, orbitRadius * Math.cos(2 * Math.PI)],
  });
  const translateY = orbitValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, orbitRadius * Math.sin(2 * Math.PI)],
  });

  // Get ring status display (Active only - security managed in Safety page)
  const getRingStatusColor = () => {
    return theme.success;
  };

  const getRingStatusText = () => {
    return 'Active';
  };

  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}>
      <Header title="Ring" />

      <ScrollView contentContainerStyle={{paddingBottom:90}} showsVerticalScrollIndicator={false}>
        {/* Ring Hero Visual with Revolving Animation */}
        <RNView style={styles.orbitContainer}>
          <Animated.View style={[styles.ringHeroContainer, {transform: [{translateX}, {translateY}, {scale: pulseValue}]}]}>
            <Image 
              source={require('../../assets/images/ring.jpeg')} 
              style={styles.ringImage}
              resizeMode="contain"
            />
          </Animated.View>
        </RNView>

        {/* Brand Logo */}
        <RNView style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.jpg')} 
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </RNView>

        {/* Ring Info Card */}
        <Card style={styles.statusCard} padding={20}>
          <RNView style={styles.statusHeader}>
            <Text variant="subtext">Ring Status</Text>
            <RNView style={styles.statusIndicator}>
              <RNView style={[styles.statusDot, {backgroundColor: theme.success}]} />
              <Text variant="bodyStrong" style={{color: theme.success}}>Active</Text>
            </RNView>
          </RNView>

          <RNView style={styles.statusRow}>
            <Text variant="subtext">Ring ID</Text>
            <Text variant="bodyStrong">{ring.id}</Text>
          </RNView>

          <RNView style={styles.statusRow}>
            <Text variant="subtext">Linked Account</Text>
            <Text variant="bodyStrong">{ring.linked}</Text>
          </RNView>

          <RNView style={styles.statusRow}>
            <Text variant="subtext">Last Sync</Text>
            <Text variant="bodyStrong">{lastSyncTime}</Text>
          </RNView>


        </Card>

        {/* Action Group */}
        <RNView style={styles.actionGroup}>
          {/* Primary Action: Sync Ring */}
          <TouchableOpacity 
            style={[styles.primaryAction, {
              backgroundColor: theme.accent,
              opacity: isSyncing ? 0.7 : 1,
              shadowColor: theme.accent,
            }]} 
            onPress={handleSyncRing}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons 
              name={isSyncing ? "sync" : "sync"} 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.primaryActionText}>
              {isSyncing ? 'Syncing…' : 'Sync Ring'}
            </Text>
          </TouchableOpacity>

          {/* Secondary Actions Row */}
          <RNView style={styles.secondaryActionsRow}>
            <TouchableOpacity 
              style={[styles.secondaryAction, {
                backgroundColor: 'rgba(79, 163, 255, 0.1)',
                borderColor: 'rgba(79, 163, 255, 0.25)',
              }]}
              onPress={()=>navigation.navigate('Offers')}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="gift-outline" size={18} color="#4FA3FF" />
              <Text style={[styles.secondaryActionText, {color: '#4FA3FF'}]}>Offers</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryAction, {
                backgroundColor: `${theme.accent}15`,
                borderColor: `${theme.accent}40`,
                opacity: isRepairing ? 0.6 : 1,
              }]}
              onPress={handleRepairRing}
              disabled={isRepairing}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name={isRepairing ? "loading" : "link-variant"} 
                size={18} 
                color={theme.accent} 
              />
              <Text style={[styles.secondaryActionText, {color: theme.accent}]}>
                {isRepairing ? 'Repairing…' : 'Re-pair'}
              </Text>
            </TouchableOpacity>
          </RNView>
        </RNView>
      </ScrollView>
    </RNView>
  );
}

const styles = StyleSheet.create({
  container: {flex:1,padding:18},
  orbitContainer: {alignItems:'center',justifyContent:'center',marginTop:16,marginBottom:24,height:280,position:'relative'},
  ringHeroContainer: {alignItems:'center',justifyContent:'center',width:220,height:220},
  ringImage: {width:200,height:200,opacity:0.95},
  logoContainer: {alignItems:'center',marginBottom:20},
  brandLogo: {width:140,height:50,opacity:0.8},
  statusCard: {marginBottom:24},
  statusHeader: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},
  statusIndicator: {flexDirection:'row',alignItems:'center'},
  statusDot: {width:8,height:8,borderRadius:4,marginRight:8},
  statusRow: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:12},
  blockWarning: {flexDirection:'row',alignItems:'center',paddingVertical:10,paddingHorizontal:12,borderRadius:8,borderWidth:1,backgroundColor:'rgba(224,90,90,0.08)'},
  // Action Group Styles
  actionGroup: {gap:12,paddingBottom:20},
  primaryAction: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:10,
    paddingVertical:16,
    paddingHorizontal:24,
    borderRadius:16,
    shadowOpacity:0.15,
    shadowRadius:12,
    shadowOffset:{width:0,height:4},
    elevation:4,
  },
  primaryActionText: {
    fontSize:16,
    fontWeight:'700',
    color:'#FFFFFF',
    letterSpacing:0.3,
  },
  secondaryActionsRow: {
    flexDirection:'row',
    gap:12,
  },
  secondaryAction: {
    flex:1,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:8,
    paddingVertical:14,
    paddingHorizontal:16,
    borderRadius:12,
    borderWidth:1,
  },
  secondaryActionText: {
    fontSize:14,
    fontWeight:'600',
    letterSpacing:0.2,
  }
});
