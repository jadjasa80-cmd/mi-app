import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';

export default function SeguimientoScreen() {
  const { weeklies, setWeeklies, currentWeekly, setCurrentWeekly, pillars } = useStore();
  const { request } = useApi();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWeeklies();
  }, []);

  const loadWeeklies = async () => {
    try {
      const data = await request('/weeklies');
      setWeeklies(data);
      if (data.length > 0) {
        setCurrentWeekly(data[0]);
      }
    } catch (error) {
      console.error('Error loading weeklies:', error);
    }
  };

  const handleCreateWeekly = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const newWeekly = await request('/weeklies', {
        method: 'POST',
        body: JSON.stringify({
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
        }),
      });

      await loadWeeklies();
      setCurrentWeekly(newWeekly);
    } catch (error) {
      console.error('Error creating weekly:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Seguimiento</Text>
        <TouchableOpacity onPress={handleCreateWeekly} disabled={loading}>
          <Ionicons name="add" size={28} color={Colors.dark.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {weeklies.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyText}>No hay revisiones semanales</Text>
            <Text style={styles.emptySubtext}>Crea tu primera revisión para comenzar</Text>
            <TouchableOpacity
              onPress={handleCreateWeekly}
              style={styles.createButton}
              disabled={loading}
            >
              <Text style={styles.createButtonText}>Nueva Revisión Semanal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          weeklies.map((weekly) => {
            const weekStart = new Date(weekly.week_start);
            const weekEnd = new Date(weekly.week_end);
            return (
              <TouchableOpacity key={weekly.id} style={styles.weeklyCard}>
                <View style={styles.weeklyHeader}>
                  <View>
                    <Text style={styles.weeklyTitle}>
                      Semana {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
                    </Text>
                    <Text style={styles.weeklySubtitle}>
                      {weekly.pillar_reviews.length} pilares revisados
                    </Text>
                  </View>
                  {weekly.completed && (
                    <Ionicons name="checkmark-circle" size={24} color={Colors.dark.success} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  weeklyCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  weeklySubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
});