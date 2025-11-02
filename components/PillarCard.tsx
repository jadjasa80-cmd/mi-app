import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface PillarCardProps {
  pillar: {
    id: string;
    name: string;
    color: string;
    icon: string;
    fields: any[];
  };
  onPress: () => void;
  onDelete: () => void;
}

export default function PillarCard({ pillar, onPress, onDelete }: PillarCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.colorBar, { backgroundColor: pillar.color }]} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={pillar.icon as any} size={32} color={pillar.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{pillar.name}</Text>
          <Text style={styles.fieldsCount}>
            {pillar.fields.length} campos configurados
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={20} color={Colors.dark.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  colorBar: {
    width: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  fieldsCount: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
});