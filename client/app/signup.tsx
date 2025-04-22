import axios from "axios";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SignupScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // force app to re-render when it comes back from background
    const handleAppStateChange = () => {
      setError((prev) => prev);
    };

    return () => {};
  }, []);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/signup", {
        username,
        email: email.toLowerCase(),
        password,
      });

      router.replace("/login"); // Navigate to login after signup
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 409) {
          setError(
            "A user with this username or email already exists. Please try a different one or log in."
          );
        } else {
          setError(
            `Error: ${
              err.response.data.message || "An unexpected error occurred."
            }`
          );
        }
      } else {
        setError("Network error. Please check your connection and try again.");
      }
      console.error(err);
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === "Enter") {
      handleSubmit(e);
    }
  };

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
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo and Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>ReelRivals</Text>
              <Text style={styles.subtitle}>Share your competitive side!</Text>
            </View>

            {/* Signup Form */}
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
                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                returnKeyType="next" // Move to the email input after "Enter"
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
                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                returnKeyType="next" // Move to the password input after "Enter"
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
                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                returnKeyType="next" // Move to the confirm password input after "Enter"
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
                onSubmitEditing={handleSubmit} // Trigger handleSubmit when "Enter" is pressed
                returnKeyType="done" // Submit the form when "Enter" is pressed on confirm password
              />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.signupButton}
                onPress={handleSubmit} // Trigger handleSubmit when button is pressed
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Login Option */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </Link>
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
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  headerContainer: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
  },
  formContainer: {
    width: "100%",
  },
  input: {
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
  signupButton: {
    backgroundColor: "#00d4ff",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 5,
  },
  signupButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  loginText: {
    color: "#CCC",
  },
  loginLink: {
    color: "#00d4ff",
    fontWeight: "bold",
  },
});
