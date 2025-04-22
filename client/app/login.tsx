import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get("http://localhost:3001/home", {
          withCredentials: true,
        });

        if (response.status === 200) {
          router.replace("/home");
        }
      } catch (err) {
        // No active session — continue to login
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (!username || !password) {
      setError("All fields are required.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/login",
        {
          username: username.toLowerCase(),
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        await AsyncStorage.setItem("username", username.toLowerCase());
        router.replace("/home");
      } else {
        setError(`Login failed: ${response.data?.message || "Unknown error"}`);
        console.error("Server response:", response);
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(
          `Login failed: ${err.response.data?.error || "Invalid credentials"}`
        );
      } else {
        setError("Network error. Please check your connection and try again.");
      }
    }
  };

  if (checkingSession) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#00d4ff" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar
        style="light"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
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
              autoCapitalize="none"
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
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
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/signup");
                  setError("");
                }}
              >
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
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "#000",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#1F1F1F",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    color: "#FFF",
  },
  errorText: {
    color: "#ff4d4d",
    marginBottom: 15,
    textAlign: "center",
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#000",
  },
  loginButton: {
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 5,
    width: "100%",
  },
  loginButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    color: "#CCC",
  },
  signupLink: {
    color: "#00d4ff",
    fontWeight: "bold",
  },
});
