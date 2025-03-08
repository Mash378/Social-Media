import React, {useEffect, useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    SafeAreaView
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function SignupScreen() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // force app to re-render when it comes back from background
        const handleAppStateChange = () => {
            setError(prev => prev);
        };

        return () => {
        };
    }, []);

    const handleSignup = () => {
        // reset any previous errors
        setError('');


        if (!username || !email || !password || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // to-do : connect to backend (displays sign up info on terminal for now)
        console.log('Signup data:', { username, email, password });

        // navigate to feed/videos
        //router.replace('/feed');
    };

    return (
        <>
        <StatusBar style="light" backgroundColor="transparent" translucent={true} />

        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo and Header */}
                    <View style={styles.headerContainer}>
                        {/* <Image
                            source={require('../assets/reelrivals-logo.png')}
                            style={styles.logo}
                            // insert logo
                        /> */}
                        <Text style={styles.title}>ReelRivals</Text>
                        <Text style={styles.subtitle}>Share your competitive side!</Text>
                    </View>

                    {/* signup Form */}
                    <View style={styles.formContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#888"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                            autoComplete="username-new"
                            textContentType="username"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#888"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            textContentType="emailAddress"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password-new"
                            textContentType="newPassword"
                            passwordRules="minlength: 8; required: lower; required: upper; required: digit; required: [-];"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#888"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoComplete="password-new"
                            textContentType="newPassword"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            style={styles.signupButton}
                            onPress={handleSignup} /* to-do : connect to backend*/
                        >
                            <Text style={styles.signupButtonText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>


                    {/* Login Option */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        {/*<Link href="/login" asChild>
                            <TouchableOpacity>
                                <Text style={styles.loginLink}>Log In</Text>
                            </TouchableOpacity>
                        </Link> include path to login page */}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
            </>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#000',
    },
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    keyboardAvoid: {
        flex: 1,
        backgroundColor: '#000'
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
        justifyContent: 'center',
        backgroundColor: '#000'
    },
    headerContainer: {
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 40,
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFF',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        backgroundColor: '#1F1F1F',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        color: '#FFF',
    },
    errorText: {
        color: '#00d4ff',
        marginBottom: 15,
        textAlign: 'center',
    },
    signupButton: {
        backgroundColor: '#00d4ff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 5,
    },
    signupButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 25,
    },
    separator: {
        flex: 1,
        height: 1,
        backgroundColor: '#333',
    },
    separatorText: {
        color: '#CCC',
        paddingHorizontal: 10,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 30,
    },
    loginText: {
        color: '#CCC',
    },
    loginLink: {
        color: '#00d4ff',
        fontWeight: 'bold',
    },
});