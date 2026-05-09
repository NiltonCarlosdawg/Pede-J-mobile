import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../theme';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  loading?: boolean;
}

export function SearchBar({
  placeholder = 'Pesquisar...',
  value,
  onChangeText,
  onSubmit,
  onClear,
  loading = false,
}: SearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="magnify"
        size={20}
        color={colors.neutral[400]}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[300]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        editable={!loading}
      />
      {value && !loading && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <MaterialCommunityIcons name="close" size={18} color={colors.neutral[400]} />
        </TouchableOpacity>
      )}
      {loading && (
        <MaterialCommunityIcons
          name="loading"
          size={18}
          color={colors.primary[500]}
          style={styles.loadingIcon}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.sm,
    color: colors.neutral[900],
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  loadingIcon: {
    marginLeft: spacing.xs,
  },
});
