import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';

export default function TiendaScreen() {
  const { creditBalance, setCreditBalance, restrictedApps, setRestrictedApps, activeSessions, setActiveSessions } = useStore();
  const { request } = useApi();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setRefreshing(true);
      const [balance, apps, sessions] = await Promise.all([
        request('/credits/balance'),
        request('/apps'),
        request('/apps/sessions/active'),
      ]);
      setCreditBalance(balance.balance);
      setRestrictedApps(apps);
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Error loading tienda data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePurchase = async (appId: string, appName: string, price: number) => {
    if (creditBalance < price) {
      Alert.alert(
        'Créditos insuficientes',
        'Completa tareas para ganar más créditos'
      );
      return;
    }

    Alert.alert(
      'Comprar tiempo',
      `¿Quieres comprar tiempo de ${appName} por ${price} créditos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comprar',
          onPress: async () => {
            try {
              await request(`/apps/${appId}/purchase`, { method: 'POST' });
              await loadData();
              Alert.alert('Éxito', 'Tiempo comprado correctamente');
            } catch (error) {
              console.error('Error purchasing app time:', error);
              Alert.alert('Error', 'No se pudo completar la compra');
            }
          },
        },
      ]
    );
  };

  const getRemainingTime = (session: any) => {
    const end = new Date(session.end_time);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tienda</Text>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceContent}>
          <Ionicons name="star" size={32} color={Colors.dark.warning} />
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Créditos disponibles</Text>
            <Text style={styles.balanceAmount}>{creditBalance.toFixed(1)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={loadData}>
          <Ionicons name="refresh" size={24} color={Colors.dark.primary} />
        </TouchableOpacity>
      </View>

      {activeSessions.length > 0 && (
        <View style={styles.activeSessionsContainer}>
          <Text style={styles.sectionTitle}>Sesiones activas</Text>
          {activeSessions.map((session) => {
            const app = restrictedApps.find((a) => a.id === session.app_id);
            if (!app) return null;
            return (
              <View key={session.id} style={styles.sessionCard}>
                <Ionicons name={app.icon as any} size={24} color={Colors.dark.primary} />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionName}>{app.name}</Text>
                  <Text style={styles.sessionTime}>Tiempo restante: {getRemainingTime(session)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Apps disponibles</Text>
        {restrictedApps.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyText}>No hay apps disponibles</Text>
            <Text style={styles.emptySubtext}>Configura apps en ajustes</Text>
          </View>
        ) : (
          restrictedApps.map((app) => (
            <View key={app.id} style={styles.appCard}>
              <View style={styles.appIcon}>
                <Ionicons name={app.icon as any} size={32} color={Colors.dark.primary} />
              </View>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>{app.name}</Text>
                <View style={styles.appDetails}>
                  <Text style={styles.appDetail}>{app.duration} min</Text>
                  <Text style={styles.appDetailSeparator}>•</Text>
                  <Text style={styles.appDetail}>{app.price} créditos</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handlePurchase(app.id, app.name, app.price)}
                style={[
                  styles.buyButton,
                  creditBalance < app.price && styles.buyButtonDisabled,
                ]}
                disabled={creditBalance < app.price}
              >
                <Text
                  style={[
                    styles.buyButtonText,
                    creditBalance < app.price && styles.buyButtonTextDisabled,
                  ]}
                >
                  Comprar
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceInfo: {
    gap: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  activeSessionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: Colors.dark.success,
  },
  scrollView: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  appIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  appDetails: {
    flexDirection: 'row',
    gap: 8,
  },
  appDetail: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  appDetailSeparator: {
    color: Colors.dark.textSecondary,
  },
  buyButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonDisabled: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  buyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  buyButtonTextDisabled: {
    color: Colors.dark.textSecondary,
  },
});