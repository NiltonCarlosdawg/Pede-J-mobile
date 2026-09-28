import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { OrderStatus } from '../../store/ordersSlice';
import { shadowStyle } from '../../utils/shadow';
import { getStatusIndex, TRACKING_STEPS } from './constants';

interface TrackingStepsProps {
  status: OrderStatus;
}

export function TrackingSteps({ status }: TrackingStepsProps) {
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        timeline: {
          position: 'relative',
          paddingLeft: 24,
          marginBottom: 32,
        },
        timelineLine: {
          position: 'absolute',
          left: 11,
          top: 24,
          bottom: 24,
          width: 2,
          backgroundColor: colors.surfaceVariant,
        },
        stepItem: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 16,
          marginBottom: 24,
        },
        pendingStep: {
          opacity: 0.5,
        },
        stepIcon: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.surfaceVariant,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: colors.white,
          zIndex: 1,
        },
        completedIcon: {
          backgroundColor: colors.secondary[500],
        },
        activeIcon: {
          backgroundColor: colors.primary[500],
          ...shadowStyle({
            color: colors.primary[500],
            offsetY: 0,
            blur: 8,
            opacity: 0.2,
            elevation: 4,
          }),
        },
        pendingDot: {
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.white,
        },
        stepContent: {
          flex: 1,
        },
        stepTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.onSurface,
        },
        activeStepTitle: {
          fontWeight: '700',
        },
        stepTime: {
          fontSize: 14,
          color: colors.neutral[500],
        },
        driverText: {
          fontSize: 14,
          color: colors.primary[500],
          fontWeight: '500',
        },
      }),
    [colors],
  );

  const idx = getStatusIndex(status);

  return (
    <View style={styles.timeline}>
      <View style={styles.timelineLine} />
      {TRACKING_STEPS.map((step, index) => {
        const isCompleted = index < idx;
        const isActive = index === idx;
        return (
          <View
            key={step.id}
            style={[styles.stepItem, !isCompleted && !isActive && styles.pendingStep]}
          >
            <View
              style={[
                styles.stepIcon,
                isCompleted && styles.completedIcon,
                isActive && styles.activeIcon,
              ]}
            >
              {isCompleted ? (
                <MaterialCommunityIcons name="check" size={14} color={colors.white} />
              ) : isActive ? (
                <MaterialCommunityIcons name="moped" size={14} color={colors.white} />
              ) : (
                <View style={styles.pendingDot} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, isActive && styles.activeStepTitle]}>
                {step.title}
              </Text>
              {step.time && <Text style={styles.stepTime}>{step.time}</Text>}
              {isActive && step.driver && <Text style={styles.driverText}>{step.driver}</Text>}
            </View>
          </View>
        );
      })}
    </View>
  );
}
