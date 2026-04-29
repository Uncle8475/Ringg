import React from 'react';
import {View as RNView, StyleSheet, Image, ScrollView} from 'react-native';
import Header from '../components/Header';
import {useTheme} from '../theme';
import {Text} from '../uikit';

export default function About(){
  const theme = useTheme();
  const styles = createStyles(theme);
  return (
    <RNView style={[styles.container,{backgroundColor: theme.background}]}> 
      {/* Background Watermark */}
      <Image 
        source={require('../../assets/images/logo.jpg')} 
        style={styles.backgroundWatermark}
        resizeMode="contain"
      />
      
      <Header title="About COSMIC ATTIRE" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:90}}>
        <RNView style={styles.content}>
          {/* COSMIC ATTIRE Logo */}
          <Image 
            source={require('../../assets/images/logo.jpg')} 
            style={styles.mainLogo}
            resizeMode="contain"
          />
          
          {/* About Content */}
          <Text variant="body" style={styles.paragraph}>
            Cosmic Attire was founded with a simple but powerful insight: modern life still relies on fragmented, inefficient identity systems—physical ID cards, keys, passwords, and manual logbooks. These systems waste time, create security risks, and slow people down.
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            We are solving this by introducing the OmniKey Ring, a minimal, matte-black smart ring that acts as a single universal access key. The ring enables identity verification, secure logins, access control, and offline token-based payments, all without carrying cards or remembering credentials.
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            Built on secure technology and cryptographic authentication, OmniKey is designed for universities, hostels, workplaces, gated societies, events, and enterprise systems. Our focus is not flashy tech but practical, invisible infrastructure that blends seamlessly into daily life.
          </Text>
          
          <Text variant="body" style={styles.paragraph}>
            At Cosmic Attire, we believe the future of access is wearable, private, and frictionless. We are not just replacing cards—we are redefining how people interact with physical and digital spaces.
          </Text>
          
          {/* Footer */}
          <RNView style={styles.footerContainer}>
            <Text variant="caption" style={styles.footer}>@Cosmic Attire</Text>
            <Text variant="caption" style={styles.footer}>@Modnex Solutions Private Limited</Text>
          </RNView>
        </RNView>
      </ScrollView>
    </RNView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container:{flex:1,position:'relative',overflow:'hidden'},
  scrollView:{flex:1},
  content:{padding:24,position:'relative',zIndex:1},
  backgroundWatermark:{position:'absolute',top:'50%',left:'50%',transform:[{translateX:-120},{translateY:-120}],width:240,height:240,opacity:0.16,zIndex:0},
  mainLogo:{width:140,height:70,alignSelf:'center',marginBottom:32,opacity:0.87},
  paragraph:{color: theme.textSecondary,fontSize:16,lineHeight:26,marginBottom:20,textAlign:'left'},
  footerContainer:{marginTop:24,alignItems:'center',gap:6},
  footer:{color: theme.textMuted,fontSize:13,textAlign:'center'}
});
