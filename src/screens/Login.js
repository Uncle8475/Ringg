import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import * as Linking from 'expo-linking';
import supabase from '../lib/supabase';
import { useAuth } from '../lib/authContext';
import { useTheme } from '../theme';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const theme = useTheme();
    const styles = createStyles(theme);
    const { signIn, signUp } = useAuth();

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            if (isRegistering) {
                const { error, needsEmailConfirmation } = await signUp({ email, password });
                if (error) {
                    throw new Error(error);
                }

                if (needsEmailConfirmation) {
                    Alert.alert(
                        'Verify your email',
                        'We sent a verification link to your email. Please verify, then sign in.'
                    );
                    setLoading(false);
                    return;
                }

                Alert.alert('Success', 'Account created! Welcome to Cosmic Attire.');
                // Auth context already set setupStage, just navigate
                navigation.navigate('OTPVerification');
            } else {
                const { error } = await signIn({ email, password });
                if (error) {
                    throw new Error(error);
                }
                // Auth context already set setupStage, just navigate
                navigation.navigate('OTPVerification');
            }
        } catch (error) {
            let msg = error.message;
            if (msg.includes('sb_publishable')) {
                msg = "System Configuration Error: The Supabase key is invalid. Please check supabaseClient.js.";
            }
            Alert.alert('Authentication Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.contentContainer}>
                    {/* Logo Section */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/logo.jpg')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.appName}>COSMIC ATTIRE</Text>
                        <Text style={styles.subtitle}>
                            {isRegistering ? 'Create your account' : 'Welcome back'}
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                placeholder="Ex: john@cosmic.com"
                                placeholderTextColor={theme.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={[styles.input, { color: theme.textPrimary }]}
                                placeholder="********"
                                placeholderTextColor={theme.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isRegistering ? 'Sign Up' : 'Log In'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsRegistering(!isRegistering)}
                        >
                            <Text style={styles.switchText}>
                                {isRegistering
                                    ? 'Already have an account? Log In'
                                    : "Don't have an account? Sign Up"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'center',
    },
    contentContainer: {
        paddingHorizontal: 32,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logo: {
        width: 88,
        height: 88,
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 12,
    },
    appName: {
        color: theme.textPrimary,
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: 3,
        marginBottom: 10,
    },
    subtitle: {
        color: theme.textSecondary,
        fontSize: 16,
        fontWeight: '500',
        opacity: 0.85,
    },
    form: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        color: theme.textSecondary,
        marginBottom: 10,
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        opacity: 0.9,
    },
    input: {
        backgroundColor: theme.card,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 20,
        color: theme.textPrimary,
        borderWidth: 1.5,
        borderColor: `${theme.border}40`,
        fontSize: 16,
        fontWeight: '500',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    button: {
        backgroundColor: theme.secondary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 0,
        shadowColor: theme.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: theme.textOnDark,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    switchButton: {
        marginTop: 32,
        alignItems: 'center',
    },
    switchText: {
        color: theme.textTertiary,
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.8,
    },
});
