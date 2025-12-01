import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../components';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius, FontSizes } from '../constants/spacing';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface EmailVerificationScreenProps {
  email?: string;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
}

export const EmailVerificationScreen: React.FC<
  EmailVerificationScreenProps
> = ({ email = 'user@example.com', onVerify, onResend, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    if (text && !/^[0-9]$/.test(text)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // UI only - no actual verification
    onVerify();
  };

  const handleResend = () => {
    // UI only - no actual resend
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    onResend();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <FontAwesome6
            name="chevron-left"
            size={20}
            color={Colors.text}
            iconStyle="solid"
          />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome6 name="envelope" size={40} color={Colors.primary} />
          </View>
        </View>

        {/* Title */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>We've sent a verification code to</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              value={digit}
              onChangeText={text => handleCodeChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Verify Button */}
        <Button
          title="Verify Email"
          onPress={handleVerify}
          variant="primary"
          size="large"
          style={styles.verifyButton}
          disabled={code.some(digit => !digit)}
        />

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryLight,
    opacity: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  codeInput: {
    width: 50,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 2,
    borderColor: Colors.border,
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  verifyButton: {
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
  },
  resendLink: {
    fontSize: FontSizes.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
