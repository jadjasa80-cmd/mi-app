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
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';

export default function CalendarioScreen() {
  const { events, setEvents, addEvent, updateEvent, deleteEvent, pillars } = useStore();
  const { request } = useApi();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    loadEvents();
    generateWeekDays();
  }, []);

  const generateWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    setWeekDays(days);
  };

  const loadEvents = async () => {
    try {
      const data = await request('/calendar');
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleCompleteEvent = async (eventId: string) => {
    try {
      const result = await request(`/calendar/${eventId}/complete`, { method: 'POST' });
      Alert.alert('¡Completado!', `Has ganado ${result.credits_earned} créditos`);
      await loadEvents();
    } catch (error: any) {
      if (error.message.includes('already completed')) {
        Alert.alert('Info', 'Esta tarea ya ha sido completada');
      } else {
        console.error('Error completing event:', error);
        Alert.alert('Error', 'No se pudo completar la tarea');
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert('Eliminar evento', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await request(`/calendar/${eventId}`, { method: 'DELETE' });
            deleteEvent(eventId);
          } catch (error) {
            console.error('Error deleting event:', error);
          }
        },
      },
    ]);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return isSameDay(eventDate, date);
    });
  };

  const getPillarById = (pillarId: string) => {
    return pillars.find((p) => p.id === pillarId);
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
      </View>

      <View style={styles.weekContainer}>
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const dayEvents = getEventsForDate(day);
          return (
            <TouchableOpacity
              key={day.toISOString()}
              onPress={() => setSelectedDate(day)}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.dayName,
                  isSelected && styles.dayNameSelected,
                ]}
              >
                {format(day, 'EEE', { locale: es })}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  isSelected && styles.dayNumberSelected,
                ]}
              >
                {format(day, 'd')}
              </Text>
              {dayEvents.length > 0 && (
                <View style={styles.eventDot} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dateHeader}>
        <Text style={styles.dateTitle}>
          {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
        </Text>
        <Text style={styles.eventCount}>
          {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'evento' : 'eventos'}
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {selectedDateEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyText}>No hay eventos para este día</Text>
          </View>
        ) : (
          selectedDateEvents.map((event) => {
            const pillar = event.pillar_id ? getPillarById(event.pillar_id) : null;
            const startTime = format(new Date(event.start), 'HH:mm');
            const endTime = format(new Date(event.end), 'HH:mm');

            return (
              <View
                key={event.id}
                style={[
                  styles.eventCard,
                  event.completed && styles.eventCardCompleted,
                ]}
              >
                {pillar && (
                  <View
                    style={[
                      styles.eventColorBar,
                      { backgroundColor: pillar.color },
                    ]}
                  />
                )}
                <View style={styles.eventContent}>
                  <View style={styles.eventHeader}>
                    <Text style={[
                      styles.eventTitle,
                      event.completed && styles.eventTitleCompleted,
                    ]}>
                      {event.title}
                    </Text>
                    {event.completed && (
                      <Ionicons name="checkmark-circle" size={20} color={Colors.dark.success} />
                    )}
                  </View>
                  <Text style={styles.eventTime}>
                    {startTime} - {endTime}
                  </Text>
                  {pillar && (
                    <View style={styles.eventPillar}>
                      <Ionicons
                        name={pillar.icon as any}
                        size={16}
                        color={pillar.color}
                      />
                      <Text style={styles.eventPillarText}>{pillar.name}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.eventActions}>
                  {!event.completed && (
                    <TouchableOpacity
                      onPress={() => handleCompleteEvent(event.id)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="checkmark" size={24} color={Colors.dark.success} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleDeleteEvent(event.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash" size={20} color={Colors.dark.error} />
                  </TouchableOpacity>
                </View>
              </View>
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    minWidth: 48,
  },
  dayButtonSelected: {
    backgroundColor: Colors.dark.primary,
  },
  dayName: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dayNameSelected: {
    color: 'white',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  dayNumberSelected: {
    color: 'white',
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.primary,
    marginTop: 4,
  },
  dateHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  eventCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
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
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventCardCompleted: {
    opacity: 0.7,
  },
  eventColorBar: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1,
  },
  eventTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.dark.textSecondary,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  eventPillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventPillarText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  eventActions: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 8,
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});