import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';
import { useApi } from '../../hooks/useApi';

export default function PropuestasScreen() {
  const { proposals, setProposals, addProposal, updateProposal, deleteProposal } = useStore();
  const { request } = useApi();
  const [newProposal, setNewProposal] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await request('/proposals');
      setProposals(data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const handleAdd = async () => {
    if (!newProposal.trim()) {
      Alert.alert('Error', 'Escribe una propuesta');
      return;
    }

    try {
      const data = await request('/proposals', {
        method: 'POST',
        body: JSON.stringify({ text: newProposal }),
      });
      addProposal(data);
      setNewProposal('');
    } catch (error) {
      console.error('Error creating proposal:', error);
      Alert.alert('Error', 'No se pudo crear la propuesta');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await request(`/proposals/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ archived: true }),
      });
      deleteProposal(id);
    } catch (error) {
      console.error('Error archiving proposal:', error);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Eliminar Propuesta', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await request(`/proposals/${id}`, { method: 'DELETE' });
            deleteProposal(id);
          } catch (error) {
            console.error('Error deleting proposal:', error);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Propuestas</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="¿Qué deberías revisar o añadir?"
          placeholderTextColor={Colors.dark.textSecondary}
          value={newProposal}
          onChangeText={setNewProposal}
          multiline
        />
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {proposals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bulb-outline" size={64} color={Colors.dark.textSecondary} />
            <Text style={styles.emptyText}>No hay propuestas aún</Text>
            <Text style={styles.emptySubtext}>Agrega ideas para mejorar tus pilares</Text>
          </View>
        ) : (
          proposals.map((proposal) => (
            <View key={proposal.id} style={styles.proposalCard}>
              <View style={styles.proposalContent}>
                <Text style={styles.proposalText}>{proposal.text}</Text>
                <Text style={styles.proposalDate}>
                  {new Date(proposal.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleArchive(proposal.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="archive" size={20} color={Colors.dark.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(proposal.id)}
                  style={styles.actionButton}
                >
                  <Ionicons name="trash" size={20} color={Colors.dark.error} />
                </TouchableOpacity>
              </View>
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    minHeight: 60,
  },
  addButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  proposalCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  proposalContent: {
    flex: 1,
  },
  proposalText: {
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  proposalDate: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
});