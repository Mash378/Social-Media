import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Feather, Ionicons } from '@expo/vector-icons'
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
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [secureTextEntry, SecureState]= useState(true);
    
    const handleSubmit = async () => {
        setError('');
        
        if (!email || !password) {
            setError('All fields are required.');
            return;
        }
    
        try {
            // Make POST request to /login
            const response = await axios.post('http://localhost:3001/login', {
                email: email.toLowerCase(),
                password: password
            });

<<<<<<< Updated upstream:reel-rivals/app/login.tsx
            axios.get('http://localhost:8081/home')
            .then((response) => {
                console.log('Successful GET response!');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
=======
            if (response.status === 200) {
                await AsyncStorage.setItem('username', username.toLowerCase());
                router.replace('/tab/home');
            } else {
                setError(`Login failed: ${response.data?.message || 'Unknown error'}`);
                console.error('Server response:', response);
            }
>>>>>>> Stashed changes:client/app/login.tsx

            router.replace('/home');
        } catch (err: any) {
            if (err.response) {
                setError('Login failed. Ensure the username and password you entered are correct and try again.');
            } else {
                setError('Network error. Please check your connection and try again.');
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
                        
                        <View style={styles.InputField}>
                            <Ionicons name={"mail-outline"} size={30} color="#FFF"/>
                            <TextInput
                                style={styles.input} 
                                placeholder='Email'
                                placeholderTextColor="#888" 
                                value={email} 
                                keyboardType='email-address'
                                onChangeText={setEmail} 
                                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                                returnKeyType="next" // Allows moving to the password input after "Enter"
                            />
                        </View>
                        <View style={styles.InputField}>
                            <Feather name={"lock"} size={30} color="#FFF"/>
                            <TextInput 
                                style={styles.input} 
                                placeholder='Password'
                                placeholderTextColor="#888" 
                                value={password} 
                                onChangeText={setPassword} 
                                secureTextEntry={secureTextEntry} 
                                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                                returnKeyType="done" // Set "done" for the password field
                            />
                            <TouchableOpacity onPress={() => SecureState((prev) => !prev)}>
                            <Feather name={secureTextEntry ? "eye-off" : "eye"} size={20} color="#FFF"/>
                            </TouchableOpacity>
                        </View>


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
    InputField: {
        flexDirection: "row",
        alignItems: "center",
        width: '100%',
        backgroundColor: '#1F1F1F',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        color: '#FFF',        
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