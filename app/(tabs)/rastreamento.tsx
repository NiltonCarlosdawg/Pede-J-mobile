import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import { Header } from "../../src/components/ui/Header";
import { colors, spacing } from "../../src/theme";

const TRACKING_STEPS = [
  { id: "1", title: "Pedido Confirmado", time: "19:45", completed: true },
  { id: "2", title: "Em preparo", time: "19:50", completed: true },
  { id: "3", title: "Em entrega", time: null, active: true, driver: "Carlos está a caminho" },
  { id: "4", title: "Entregue", time: null, completed: false },
];

export default function TrackingScreen() {
  return (
    <View style={styles.container}>
      <Header title="Acompanhamento" />
      
 

      {/* Map Area - Simulated Map */}
      <View style={styles.mapContainer}>
        <View style={styles.mapBackground}>
          <View style={styles.mapRoadVertical} />
          <View style={styles.mapRoadHorizontal} />
          <View style={styles.mapLocation}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary[500]} />
          </View>
        </View>
        
        {/* Driver Marker */}
        <View style={styles.driverMarker}>
          <View style={styles.driverBadge}>
            <MaterialCommunityIcons name="moped" size={24} color={colors.primary[500]} />
          </View>
          <View style={styles.driverDot} />
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Delivery Status */}
        <View style={styles.statusSection}>
          <Text style={styles.arrivalTime}>Chegando em 15 min</Text>
          <Text style={styles.arrivalRange}>Previsão: 20:15 - 20:25</Text>
        </View>

        {/* Restaurant Info */}
        <View style={styles.restaurantCard}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200" }} 
            style={styles.restaurantImage} 
          />
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>Burger Joint Master</Text>
            <Text style={styles.orderNumber}>Pedido #4092</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <MaterialCommunityIcons name="phone" size={20} color={colors.secondary[500]} />
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {/* Vertical Line */}
          <View style={styles.timelineLine} />
          
          {TRACKING_STEPS.map((step, index) => (
            <View key={step.id} style={[styles.stepItem, !step.completed && !step.active && styles.pendingStep]}>
              <View style={[
                styles.stepIcon,
                step.completed && styles.completedIcon,
                step.active && styles.activeIcon,
              ]}>
                {step.completed ? (
                  <MaterialCommunityIcons name="check" size={14} color={colors.white} />
                ) : step.active ? (
                  <MaterialCommunityIcons name="moped" size={14} color={colors.white} />
                ) : (
                  <View style={styles.pendingDot} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepTitle,
                  step.active && styles.activeStepTitle,
                ]}>{step.title}</Text>
                {step.time && (
                  <Text style={styles.stepTime}>{step.time}</Text>
                )}
                {step.driver && (
                  <Text style={styles.driverText}>{step.driver}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 80,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  helpText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[500],
  },
  mapContainer: {
    height: '55%',
    position: 'relative',
    backgroundColor: colors.neutral[200],
  },
  mapBackground: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapRoadVertical: {
    position: 'absolute',
    width: 30,
    height: '100%',
    backgroundColor: colors.white,
  },
  mapRoadHorizontal: {
    position: 'absolute',
    height: 30,
    width: '100%',
    backgroundColor: colors.white,
  },
  mapLocation: {
    position: 'absolute',
    top: 30,
    right: 30,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  driverMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    alignItems: 'center',
  },
  driverBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  driverDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[500],
    opacity: 0.5,
    marginTop: -4,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingBottom: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral[300],
    alignSelf: 'center',
    marginVertical: 16,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  arrivalTime: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.onSurface,
  },
  arrivalRange: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 4,
  },
  restaurantCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.surfaceContainer,
  },
  restaurantImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  orderNumber: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    position: 'relative',
    paddingLeft: 24,
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
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
});