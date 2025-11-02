import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';
import PillarCard from '../../components/PillarCard';
import { PILLAR_COLORS, PILLAR_ICONS } from '../../constants/icons';

export default function PillaresScreen() {
  const { pillars, setPillars, deletePillar } = useStore();
  const { request } = useApi();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPillar, setEditingPillar] = useState<any>(null);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PILLAR_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('fitness');

  useEffect(() => {
    loadPillars();
  }, []);

  const loadPillars = async () => {
    try {
      const data = await request('/pillars');
      setPillars(data);
    } catch (error) {
      console.error('Error loading pillars:', error);
    }
  };

  const handleCreate = () => {
    setEditingPillar(null);
    setName('');
    setSelectedColor(PILLAR_COLORS[0]);
    setSelectedIcon('fitness');
    setModalVisible(true);
  };

  const handleEdit = (pillar: any) => {
    setEditingPillar(pillar);
    setName(pillar.name);
    setSelectedColor(pillar.color);
    setSelectedIcon(pillar.icon);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del pilar es requerido');
      return;
    }

    try {
      if (editingPillar) {
        await request(`/pillars/${editingPillar.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name,
            color: selectedColor,
            icon: selectedIcon,
          }),
        });
      } else {
        await request('/pillars', {
          method: 'POST',
          body: JSON.stringify({
            name,
            color: selectedColor,
            icon: selectedIcon,
            fields: [],
          }),
        });
      }
      await loadPillars();
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving pillar:', error);
      Alert.alert('Error', 'No se pudo guardar el pilar');
    }
  };

  const handleDelete = async (pillarId: string) => {
    Alert.alert(
      'Eliminar Pilar',
      '¿Estás seguro de que quieres eliminar este pilar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await request(`/pillars/${pillarId}`, { method: 'DELETE' });
              deletePillar(pillarId);
            } catch (error) {
              console.error('Error deleting pillar:', error);
              Alert.alert('Error', 'No se pudo eliminar el pilar');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Pilares</Text>
        <TouchableOpacity onPress={handleCreate} style={styles.addButton}>
          <Ionicons name="add" size={28} color={Colors.dark.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {pillars.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="layers-outline" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyText}>No hay pilares aún</Text>
            <Text style={styles.emptySubtext}>Crea tu primer pilar para comenzar</Text>
          </View>
        ) : (
          pillars.map((pillar) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              onPress={() => handleEdit(pillar)}
              onDelete={() => handleDelete(pillar.id)}
            />
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingPillar ? 'Editar Pilar' : 'Nuevo Pilar'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del pilar"
              placeholderTextColor={Colors.dark.textSecondary}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.sectionLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {PILLAR_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                >
                  {selectedColor === color && (
                    <Ionicons name="checkmark" size={20} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Icono</Text>
            <ScrollView horizontal style={styles.iconScroll}>
              {PILLAR_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon.name}
                  onPress={() => setSelectedIcon(icon.name)}
                  style={[
                    styles.iconOption,
                    selectedIcon === icon.name && styles.selectedIcon,
                  ]}
                >
                  <Ionicons
                    name={icon.name as any}
                    size={28}
                    color={selectedIcon === icon.name ? Colors.dark.primary : Colors.dark.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  input: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: Colors.dark.text,
  },
  iconScroll: {
    marginBottom: 24,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  selectedIcon: {
    backgroundColor: Colors.dark.primary + '20',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  saveButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});