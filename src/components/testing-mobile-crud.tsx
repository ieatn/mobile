import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { GroupedSection } from '@/components/grouped-section';
import { ThemedText } from '@/components/themed-text';
import { useSpringPalette } from '@/hooks/use-spring-palette';
import { supabase } from '@/lib/supabase';
import type { TestingMobileRow } from '@/types/testing-mobile';

const TABLE = 'testing_mobile';

type FormState = {
  title: string;
  notes: string;
};

const emptyForm = (): FormState => ({ title: '', notes: '' });

export function TestingMobileCrud() {
  const palette = useSpringPalette();
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
    Alert.alert('Delete note?', `"${row.title}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
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

  const fieldStyle = [styles.field, { backgroundColor: palette.fill, color: palette.text }];

  return (
    <View>
      <GroupedSection title="New note" footer="Dev sandbox table: testing_mobile">
        {error ? (
          <View style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}>
            <ThemedText type="small" style={{ color: palette.error }}>
              {error}
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}>
          <TextInput
            style={fieldStyle}
            placeholder="Title"
            placeholderTextColor={palette.textMuted}
            value={form.title}
            onChangeText={(title) => setForm((prev) => ({ ...prev, title }))}
            editable={!saving}
          />
        </View>
        <View style={[styles.cell, styles.bordered, { borderBottomColor: palette.separator }]}>
          <TextInput
            style={[fieldStyle, styles.notesField]}
            placeholder="Notes"
            placeholderTextColor={palette.textMuted}
            value={form.notes}
            onChangeText={(notes) => setForm((prev) => ({ ...prev, notes }))}
            multiline
            editable={!saving}
          />
        </View>
        <View style={styles.actions}>
          <Pressable
            style={[styles.actionBtn, { backgroundColor: palette.cherry }, saving && styles.disabled]}
            onPress={handleSave}
            disabled={saving}>
            <ThemedText type="smallBold" style={styles.actionLabel}>
              {editingId ? 'Save changes' : 'Add note'}
            </ThemedText>
          </Pressable>
          {editingId ? (
            <Pressable style={styles.textBtn} onPress={resetForm} disabled={saving}>
              <ThemedText type="linkPrimary">Cancel</ThemedText>
            </Pressable>
          ) : (
            <Pressable style={styles.textBtn} onPress={loadRows} disabled={loading || saving}>
              <ThemedText type="linkPrimary">Refresh</ThemedText>
            </Pressable>
          )}
        </View>
      </GroupedSection>

      <GroupedSection title="Notes">
        {loading ? (
          <View style={styles.cell}>
            <ActivityIndicator color={palette.cherry} />
          </View>
        ) : rows.length === 0 ? (
          <View style={styles.cell}>
            <ThemedText type="default" themeColor="textSecondary">
              No notes yet.
            </ThemedText>
          </View>
        ) : (
          rows.map((row, index) => (
            <View
              key={row.id}
              style={[
                styles.cell,
                index < rows.length - 1 && styles.bordered,
                index < rows.length - 1 && { borderBottomColor: palette.separator },
              ]}>
              <ThemedText type="default" style={styles.rowTitle}>
                {row.title}
              </ThemedText>
              {row.notes ? (
                <ThemedText type="small" themeColor="textSecondary" style={styles.rowNotes}>
                  {row.notes}
                </ThemedText>
              ) : null}
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(row.updated_at).toLocaleString()}
              </ThemedText>
              <View style={styles.rowActions}>
                <Pressable onPress={() => handleEdit(row)} disabled={saving}>
                  <ThemedText type="linkPrimary">Edit</ThemedText>
                </Pressable>
                <Pressable onPress={() => handleDelete(row)} disabled={saving}>
                  <ThemedText type="link" style={{ color: palette.error }}>
                    Delete
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </GroupedSection>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bordered: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  field: {
    fontSize: 17,
    lineHeight: 22,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notesField: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  actionBtn: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
  },
  textBtn: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  rowTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  rowNotes: {
    marginBottom: 4,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
});
