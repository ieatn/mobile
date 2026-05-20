import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import type { TestingMobileRow } from '@/types/testing-mobile';

const TABLE = 'testing_mobile';

type FormState = {
  title: string;
  notes: string;
};

const emptyForm = (): FormState => ({ title: '', notes: '' });

export function TestingMobileCrud() {
  const theme = useTheme();
  const [rows, setRows] = useState<TestingMobileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from(TABLE)
      .select('id, title, notes, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setRows([]);
    } else {
      setRows(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const handleSave = async () => {
    const title = form.title.trim();
    if (!title) {
      Alert.alert('Title required', 'Enter a title before saving.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error: updateError } = await supabase.from(TABLE).update(payload).eq('id', editingId);
      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from(TABLE).insert(payload);
      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    resetForm();
    await loadRows();
    setSaving(false);
  };

  const handleEdit = (row: TestingMobileRow) => {
    setEditingId(row.id);
    setForm({ title: row.title, notes: row.notes ?? '' });
  };

  const handleDelete = (row: TestingMobileRow) => {
    Alert.alert('Delete row?', `"${row.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          setError(null);
          const { error: deleteError } = await supabase.from(TABLE).delete().eq('id', row.id);
          if (deleteError) {
            setError(deleteError.message);
          } else if (editingId === row.id) {
            resetForm();
          }
          await loadRows();
          setSaving(false);
        },
      },
    ]);
  };

  const inputStyle = [
    styles.input,
    {
      color: theme.text,
      borderColor: theme.backgroundSelected,
      backgroundColor: theme.backgroundElement,
    },
  ];

  return (
    <ThemedView type="backgroundElement" style={styles.panel}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        testing_mobile
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.sectionHint}>
        Supabase CRUD sandbox (anon, dev-only policies)
      </ThemedText>

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}

      <TextInput
        style={inputStyle}
        placeholder="Title"
        placeholderTextColor={theme.textSecondary}
        value={form.title}
        onChangeText={(title) => setForm((prev) => ({ ...prev, title }))}
        editable={!saving}
      />
      <TextInput
        style={[inputStyle, styles.notesInput]}
        placeholder="Notes (optional)"
        placeholderTextColor={theme.textSecondary}
        value={form.notes}
        onChangeText={(notes) => setForm((prev) => ({ ...prev, notes }))}
        multiline
        editable={!saving}
      />

      <View style={styles.formActions}>
        <Pressable
          style={[styles.button, styles.primaryButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}>
          <ThemedText type="smallBold" style={styles.buttonLabel}>
            {editingId ? 'Update' : 'Create'}
          </ThemedText>
        </Pressable>
        {editingId ? (
          <Pressable style={styles.button} onPress={resetForm} disabled={saving}>
            <ThemedText type="smallBold">Cancel</ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.button}
          onPress={loadRows}
          disabled={loading || saving}>
          <ThemedText type="smallBold">Refresh</ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : rows.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
          No rows yet. Create one above.
        </ThemedText>
      ) : (
        <ScrollView style={styles.list} nestedScrollEnabled>
          {rows.map((row) => (
            <ThemedView key={row.id} type="background" style={styles.row}>
              <ThemedText type="smallBold">{row.title}</ThemedText>
              {row.notes ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.rowNotes}>
                  {row.notes}
                </ThemedText>
              ) : null}
              <ThemedText type="code" themeColor="textSecondary" style={styles.rowMeta}>
                {new Date(row.updated_at).toLocaleString()}
              </ThemedText>
              <View style={styles.rowActions}>
                <Pressable style={styles.rowButton} onPress={() => handleEdit(row)} disabled={saving}>
                  <ThemedText type="linkPrimary">Edit</ThemedText>
                </Pressable>
                <Pressable style={styles.rowButton} onPress={() => handleDelete(row)} disabled={saving}>
                  <ThemedText type="link" style={styles.deleteLabel}>
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  panel: {
    width: '100%',
    borderRadius: 12,
    padding: Spacing.three,
    marginTop: Spacing.four,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
  },
  sectionHint: {
    marginTop: Spacing.half,
    marginBottom: Spacing.two,
  },
  error: {
    color: '#c0392b',
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: 16,
    marginBottom: Spacing.two,
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  button: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 8,
    backgroundColor: 'rgba(128,128,128,0.15)',
  },
  primaryButton: {
    backgroundColor: '#3c87f7',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    color: '#fff',
  },
  loader: {
    marginVertical: Spacing.three,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  list: {
    maxHeight: 320,
  },
  row: {
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  rowNotes: {
    marginTop: Spacing.half,
  },
  rowMeta: {
    marginTop: Spacing.one,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  rowButton: {
    paddingVertical: Spacing.half,
  },
  deleteLabel: {
    color: '#c0392b',
  },
});
