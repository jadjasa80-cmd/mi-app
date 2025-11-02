import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';

const { width } = Dimensions.get('window');

export default function HistoricoScreen() {
  const { pillars } = useStore();
  const { request } = useApi();
  const [selectedPillar, setSelectedPillar] = useState<any>(null);
  const [selectedField, setSelectedField] = useState<any>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (pillars.length > 0 && !selectedPillar) {
      setSelectedPillar(pillars[0]);
      if (pillars[0].fields.length > 0) {
        const firstNumericField = pillars[0].fields.find(
          (f: any) => f.type === 'number'
        );
        if (firstNumericField) {
          setSelectedField(firstNumericField);
        }
      }
    }
  }, [pillars]);

  useEffect(() => {
    if (selectedPillar && selectedField) {
      loadHistoricalData();
    }
  }, [selectedPillar, selectedField]);

  const loadHistoricalData = async () => {
    try {
      const data = await request(
        `/historical/${selectedPillar.id}/${selectedField.id}`
      );
      setHistoricalData(data.data || []);
    } catch (error) {
      console.error('Error loading historical data:', error);
    }
  };

  const getChartData = () => {
    if (!historicalData || historicalData.length === 0) {
      return [];
    }
    return historicalData.map((point: any) => ({
      value: parseFloat(point.value) || 0,
      label: new Date(point.date).toLocaleDateString('es', { month: 'short', day: 'numeric' }),
    }));
  };

  const numericFields = selectedPillar?.fields.filter(
    (f: any) => f.type === 'number'
  ) || [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
      </View>

      {pillars.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bar-chart-outline" size={64} color={Colors.dark.textSecondary} />
          <Text style={styles.emptyText}>No hay datos históricos</Text>
          <Text style={styles.emptySubtext}>Crea pilares y completa revisiones</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Pilar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {pillars.map((pillar) => (
                <TouchableOpacity
                  key={pillar.id}
                  onPress={() => {
                    setSelectedPillar(pillar);
                    const firstNumericField = pillar.fields.find(
                      (f: any) => f.type === 'number'
                    );
                    if (firstNumericField) {
                      setSelectedField(firstNumericField);
                    }
                  }}
                  style={[
                    styles.pillarChip,
                    selectedPillar?.id === pillar.id && {
                      backgroundColor: pillar.color,
                    },
                  ]}
                >
                  <Ionicons
                    name={pillar.icon as any}
                    size={20}
                    color={selectedPillar?.id === pillar.id ? 'white' : Colors.dark.text}
                  />
                  <Text
                    style={[
                      styles.pillarChipText,
                      selectedPillar?.id === pillar.id && styles.pillarChipTextSelected,
                    ]}
                  >
                    {pillar.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {numericFields.length > 0 && (
            <View style={styles.selectorContainer}>
              <Text style={styles.selectorLabel}>Campo</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {numericFields.map((field: any) => (
                  <TouchableOpacity
                    key={field.id}
                    onPress={() => setSelectedField(field)}
                    style={[
                      styles.fieldChip,
                      selectedField?.id === field.id && styles.fieldChipSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.fieldChipText,
                        selectedField?.id === field.id && styles.fieldChipTextSelected,
                      ]}
                    >
                      {field.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedField && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>
                {selectedField.name}
                {selectedField.unit && ` (${selectedField.unit})`}
              </Text>
              {historicalData.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No hay datos disponibles</Text>
                  <Text style={styles.noDataSubtext}>
                    Completa revisiones semanales para ver tu progreso
                  </Text>
                </View>
              ) : (
                <View style={styles.chart}>
                  <LineChart
                    data={getChartData()}
                    width={width - 48}
                    height={220}
                    spacing={50}
                    color={selectedPillar?.color || Colors.dark.primary}
                    thickness={3}
                    startFillColor={selectedPillar?.color || Colors.dark.primary}
                    endFillColor={Colors.dark.background}
                    startOpacity={0.3}
                    endOpacity={0.1}
                    initialSpacing={0}
                    noOfSections={4}
                    yAxisColor={Colors.dark.border}
                    xAxisColor={Colors.dark.border}
                    yAxisTextStyle={{ color: Colors.dark.textSecondary }}
                    xAxisLabelTextStyle={{ color: Colors.dark.textSecondary }}
                    hideRules
                    curved
                  />
                </View>
              )}
            </View>
          )}

          {!selectedField && numericFields.length === 0 && (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No hay campos numéricos</Text>
              <Text style={styles.noDataSubtext}>
                Añade campos numéricos a tus pilares para visualizar datos
              </Text>
            </View>
          )}
        </ScrollView>
      )}
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
  selectorContainer: {
    padding: 16,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  pillarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 8,
  },
  pillarChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  pillarChipTextSelected: {
    color: 'white',
  },
  fieldChip: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  fieldChipSelected: {
    backgroundColor: Colors.dark.primary,
  },
  fieldChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  fieldChipTextSelected: {
    color: 'white',
  },
  chartContainer: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  chart: {
    marginTop: 8,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  noDataSubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
});