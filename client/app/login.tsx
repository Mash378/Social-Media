import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        
        if (!username || !password) {
            setError('All fields are required.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/login', {
                username: username.toLowerCase(),
                password: password
            });

            router.replace('/home');
        } catch (err: any) {
            if (err.response)
            {
                setError('Login failed. Ensure the username and password you entered are correct and try again.');
            }
            else
            {
                setError('Network error. Please check your connection and try again.')
            }
        }
    };

    return (
        <>
            <StatusBar style="light" backgroundColor="transparent" translucent={true} />
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoid}
                >
                    <View style={styles.container}>
                        <Text style={styles.title}>ReelRivals Login</Text>
                        
                        <TextInput
                            style={styles.input}
                            placeholder="Username"
                            placeholderTextColor="#888"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"  // Keeps the username in lowercase, if desired
                            autoComplete="username" // Provides suggestions for usernames, if available
                            textContentType="username" // Optimizes input for username entry
                        />


                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            textContentType="password"
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.loginButtonText}>Login</Text>
                        </TouchableOpacity>

                        <View style={styles.signupContainer}>
                            <Text style={styles.signupText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => {
                                router.push('/signup')
                                setError('')
                                }}>
                                <Text style={styles.signupLink}>Sign Up</Text>
                                
                            </TouchableOpacity>
                        </View>
                    </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#000',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFF',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        backgroundColor: '#1F1F1F',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        color: '#FFF',
    },
    errorText: {
        color: '#ff4d4d',
        marginBottom: 15,
        textAlign: 'center',
    },
    keyboardAvoid: {
        flex: 1,
        backgroundColor: '#000',
    },
    loginButton: {
        backgroundColor: '#00d4ff',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 5,
        width: '100%',
    },
    loginButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    signupText: {
        color: '#CCC',
    },
    signupLink: {
        color: '#00d4ff',
        fontWeight: 'bold',
    },
});