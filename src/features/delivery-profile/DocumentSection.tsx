import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { spacing } from '../../theme';
import { documentIcons, initialDocs } from './constants';

export function DocumentSection() {
  const { colors } = useTheme();
  const [documents, setDocuments] = useState<
    Record<string, { uri: string; name: string; uploadedAt: string } | null>
  >({});
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUpload = useCallback(async (docId: string) => {
    try {
      setUploadingId(docId);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const doc = initialDocs.find((d) => d.id === docId);
        setDocuments((prev) => ({
          ...prev,
          [docId]: {
            uri: file.uri,
            name: file.name || `${doc?.label || 'documento'}.pdf`,
            uploadedAt: new Date().toLocaleDateString('pt-AO'),
          },
        }));
      }
    } catch (error: any) {
      if (error?.message !== 'User cancelled') {
        Alert.alert('Erro', 'Não foi possível carregar o documento.');
      }
    } finally {
      setUploadingId(null);
    }
  }, []);

  const handleRemoveDocument = useCallback((docId: string) => {
    Alert.alert('Remover documento', 'Tem certeza que deseja remover este documento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          setDocuments((prev) => {
            const next = { ...prev };
            delete next[docId];
            return next;
          });
        },
      },
    ]);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surfaceContainerLowest,
          borderRadius: 24,
          padding: spacing.lg,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: colors.surfaceVariant,
        },
        cardHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: spacing.md,
        },
        sectionTitle: {
          fontSize: 16,
          fontWeight: '700',
          color: colors.onSurface,
        },
        editLink: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.primary[500],
        },
        documentsList: {
          gap: spacing.sm,
        },
        documentItem: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: colors.surfaceVariant,
        },
        documentIcon: {
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: colors.primary[100],
          alignItems: 'center',
          justifyContent: 'center',
        },
        documentContent: {
          flex: 1,
        },
        documentLabel: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.onSurface,
          marginBottom: 2,
        },
        documentMeta: {
          fontSize: 12,
          color: colors.neutral[500],
        },
        documentStatus: {
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.error + '15',
        },
        documentStatusValid: {
          backgroundColor: colors.primary[100],
        },
        documentStatusText: {
          fontSize: 11,
          fontWeight: '700',
          color: colors.error,
        },
        documentStatusTextValid: {
          color: colors.primary[500],
        },
        uploadButton: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: colors.primary[100],
        },
        uploadButtonText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.primary[500],
        },
        uploadedBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          paddingHorizontal: spacing.sm,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: colors.primary[100],
        },
        uploadedBadgeText: {
          fontSize: 11,
          fontWeight: '600',
          color: colors.primary[500],
        },
        removeDocButton: {
          padding: 4,
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Documentos</Text>
        <Text style={styles.editLink}>Obrigatório</Text>
      </View>
      <View style={styles.documentsList}>
        {initialDocs.map((doc) => {
          const uploaded = documents[doc.id];
          return (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentIcon}>
                <MaterialCommunityIcons
                  name={(documentIcons[doc.id] || 'file-document-outline') as any}
                  size={20}
                  color={uploaded ? colors.primary[500] : colors.neutral[400]}
                />
              </View>
              <View style={styles.documentContent}>
                <Text style={styles.documentLabel}>{doc.label}</Text>
                <Text style={styles.documentMeta}>
                  {uploaded ? `Carregado em ${uploaded.uploadedAt}` : doc.description}
                </Text>
              </View>
              {uploaded ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={styles.uploadedBadge}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={14}
                      color={colors.primary[500]}
                    />
                    <Text style={styles.uploadedBadgeText}>OK</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeDocButton}
                    onPress={() => handleRemoveDocument(doc.id)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleUpload(doc.id)}
                  disabled={uploadingId === doc.id}
                >
                  <MaterialCommunityIcons
                    name="upload"
                    size={16}
                    color={uploadingId === doc.id ? colors.neutral[400] : colors.primary[500]}
                  />
                  <Text style={styles.uploadButtonText}>
                    {uploadingId === doc.id ? '...' : 'Upload'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
