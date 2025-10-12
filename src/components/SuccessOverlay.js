import React, { useEffect } from "react";
import { View, StyleSheet, Modal, Dimensions, Animated } from "react-native";
import { Text, IconButton, Button, useTheme } from "react-native-paper";

const { width, height } = Dimensions.get("window");

const SuccessOverlay = ({
  visible,
  onDismiss,
  title = "Upload was set up successfully",
}) => {
  const theme = useTheme();
  const scaleAnim = new Animated.Value(0);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 3 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const ConfettiShape = ({ style }) => (
    <View style={[styles.confetti, style]} />
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Confetti Shapes */}
          <ConfettiShape
            style={[
              styles.confetti1,
              { backgroundColor: theme.colors.secondary },
            ]}
          />
          <ConfettiShape
            style={[styles.confetti2, { backgroundColor: "#FF6B6B" }]}
          />
          <ConfettiShape
            style={[styles.confetti3, { backgroundColor: "#4ECDC4" }]}
          />
          <ConfettiShape
            style={[styles.confetti4, { backgroundColor: "#45B7D1" }]}
          />
          <ConfettiShape
            style={[styles.confetti5, { backgroundColor: "#96CEB4" }]}
          />
          <ConfettiShape
            style={[styles.confetti6, { backgroundColor: "#FFEAA7" }]}
          />

          {/* Main Success Icon */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <IconButton
              icon="check"
              size={60}
              iconColor="#000000"
              style={styles.checkIcon}
            />
          </View>

          {/* Success Text */}
          <Text variant="headlineSmall" style={styles.successText}>
            {title}
          </Text>

          {/* Got It Button */}
          <Button
            mode="contained"
            onPress={onDismiss}
            style={styles.gotItButton}
            contentStyle={styles.gotItButtonContent}
            buttonColor={theme.colors.primary}
            textColor="#000000"
          >
            Got It
          </Button>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    position: "relative",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  checkIcon: {
    margin: 0,
  },
  successText: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 32,
    color: "#333",
    lineHeight: 28,
  },
  gotItButton: {
    minWidth: 120,
    borderRadius: 24,
  },
  gotItButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confetti: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  confetti1: {
    top: 20,
    left: 30,
    transform: [{ rotate: "45deg" }],
  },
  confetti2: {
    top: 40,
    right: 40,
    width: 8,
    height: 16,
    borderRadius: 4,
  },
  confetti3: {
    top: 80,
    left: 20,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  confetti4: {
    bottom: 100,
    right: 30,
    width: 14,
    height: 8,
    borderRadius: 7,
    transform: [{ rotate: "30deg" }],
  },
  confetti5: {
    bottom: 120,
    left: 35,
    width: 6,
    height: 12,
    borderRadius: 3,
  },
  confetti6: {
    top: 60,
    right: 60,
    width: 8,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: "60deg" }],
  },
});

export default SuccessOverlay;
