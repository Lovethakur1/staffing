import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, Modal, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import {
  getMyDocuments, uploadFileToServer, createDocumentRecord, StaffDocument,
} from '../services/extraScreens.service';
import { useAuth } from '../context/AuthContext';

type DocTab = 'all' | 'required' | 'pending' | 'expiring';

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap }> = {
  approved: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline' },
  verified:  { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline' },
  pending:  { bg: '#DBEAFE', text: '#1E40AF', icon: 'time-outline' },
  rejected: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline' },
  expired:  { bg: '#FEF3C7', text: '#92400E', icon: 'warning-outline' },
};

const DOC_TYPE_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  id: 'card-outline',
  passport: 'globe-outline',
  certificate: 'ribbon-outline',
  certification: 'ribbon-outline',
  contract: 'document-text-outline',
  license: 'shield-outline',
  background_check: 'finger-print-outline',
  tax_form: 'receipt-outline',
  other: 'document-outline',
};

const CATEGORIES = [
  { label: 'ID / License',       value: 'ID' },
  { label: 'Certification',      value: 'CERTIFICATION' },
  { label: 'Background Check',   value: 'BACKGROUND_CHECK' },
  { label: 'Tax Form',           value: 'TAX_FORM' },
  { label: 'Contract',           value: 'CONTRACT' },
  { label: 'Other',              value: 'OTHER' },
];

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<StaffDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<DocTab>('all');

  // Upload modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string; mimeType?: string; size?: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const load = async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      if (user?.id) setDocs(await getMyDocuments(user.id));
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openUploadModal = (prefillName?: string) => {
    setUploadName(prefillName || '');
    setUploadCategory('');
    setPickedFile(null);
    setUploadProgress(0);
    setModalVisible(true);
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
               'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({ uri: asset.uri, name: asset.name, mimeType: asset.mimeType, size: asset.size });
      if (!uploadName.trim()) setUploadName(asset.name.replace(/\.[^/.]+$/, ''));
    } catch {
      Alert.alert('Error', 'Could not open file picker. Please try again.');
    }
  };

  const handleUpload = async () => {
    if (!pickedFile)       { Alert.alert('Missing file', 'Please choose a file.'); return; }
    if (!uploadCategory)   { Alert.alert('Missing type', 'Please select a document type.'); return; }
    if (!uploadName.trim()) { Alert.alert('Missing name', 'Please enter a document name.'); return; }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      // Step 1 — upload file to server storage
      setUploadProgress(30);
      const { url, size, mimeType } = await uploadFileToServer({
        uri: pickedFile.uri,
        name: pickedFile.name,
        mimeType: pickedFile.mimeType,
      });
      setUploadProgress(75);

      // Step 2 — create document record in DB
      await createDocumentRecord({
        name: uploadName.trim(),
        category: uploadCategory,
        fileUrl: url,
        fileSize: size ?? pickedFile.size,
        mimeType: mimeType || pickedFile.mimeType,
      });
      setUploadProgress(100);

      Alert.alert('Uploaded!', 'Your document has been submitted and is pending admin review.');
      setModalVisible(false);
      await load(true);
    } catch (err: any) {
      Alert.alert('Upload failed', err?.response?.data?.message || 'Please check your connection and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const required = docs.filter(d => d.required);
  const approvedRequired = docs.filter(d => d.status === 'approved' && d.required);
  const completion = required.length > 0 ? Math.round((approvedRequired.length / required.length) * 100) : 0;

  const displayed = tab === 'all' ? docs
    : tab === 'required' ? docs.filter(d => d.required)
    : tab === 'pending'  ? docs.filter(d => d.status === 'pending')
    : docs.filter(d => d.status === 'expired' || (
        d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      ));

  if (loading) {
    return (
      <ScreenLayout activeTab="Documents">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Documents">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        <Text style={st.pageTitle}>Documents</Text>
        <Text style={st.pageSubtitle}>Upload and manage your documents</Text>

        {/* Stats */}
        <View style={st.statsRow}>
          {[
            { label: 'Total',      value: docs.length,                                   icon: 'folder-outline',  color: '#3B82F6' },
            { label: 'Completion', value: `${completion}%`,                               icon: 'trophy-outline',  color: '#10B981', small: true },
            { label: 'Pending',    value: docs.filter(d => d.status === 'pending').length, icon: 'time-outline',    color: '#F59E0B' },
            { label: 'Rejected',   value: docs.filter(d => d.status === 'rejected').length,icon: 'close-circle-outline', color: '#EF4444' },
          ].map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={18} color={s.color} />
              </View>
              <Text style={[st.statValue, s.small && { fontSize: 15 }]}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Compliance bar */}
        {required.length > 0 && (
          <View style={st.complianceCard}>
            <View style={st.complianceHeader}>
              <Text style={st.complianceTitle}>Document Completion</Text>
              <Text style={[st.compliancePct, { color: completion >= 80 ? '#10B981' : completion >= 50 ? '#F59E0B' : '#EF4444' }]}>{completion}%</Text>
            </View>
            <View style={st.progressBg}>
              <View style={[st.progressFill, { width: `${completion}%` as any, backgroundColor: completion >= 80 ? '#10B981' : completion >= 50 ? '#F59E0B' : '#EF4444' }]} />
            </View>
            <Text style={st.complianceSub}>{approvedRequired.length} of {required.length} required documents approved</Text>
          </View>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }} contentContainerStyle={{ paddingRight: 16 }}>
          {([['all','All'],['required','Required'],['pending','Pending'],['expiring','Expiring']] as [DocTab,string][]).map(([key,label]) => (
            <TouchableOpacity key={key} style={[st.tabChip, tab===key && st.tabChipActive]} onPress={() => setTab(key)}>
              <Text style={[st.tabText, tab===key && st.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upload button */}
        <TouchableOpacity style={st.uploadBtn} onPress={() => openUploadModal()}>
          <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
          <Text style={st.uploadBtnText}>Upload Document</Text>
        </TouchableOpacity>

        {/* List */}
        {displayed.length === 0 ? (
          <View style={st.emptyBox}>
            <Ionicons name="folder-open-outline" size={48} color={Colors.textMuted} />
            <Text style={st.emptyText}>No documents found</Text>
            <Text style={st.emptyHint}>Tap "Upload Document" to add one</Text>
          </View>
        ) : (
          displayed.map(doc => {
            const sc = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            const docIcon = DOC_TYPE_ICON[doc.type?.toLowerCase().replace(/[\s-]/g, '_')] || 'document-outline';
            return (
              <View key={doc.id} style={st.card}>
                <View style={st.cardTop}>
                  <View style={[st.docIconBox, { backgroundColor: Colors.primary + '12' }]}>
                    <Ionicons name={docIcon} size={20} color={Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.cardTitle} numberOfLines={1}>{doc.name}</Text>
                    {doc.description ? <Text style={st.cardDesc} numberOfLines={1}>{doc.description}</Text> : null}
                    {doc.required && (
                      <View style={st.requiredChip}><Text style={st.requiredText}>Required</Text></View>
                    )}
                  </View>
                  <View style={[st.badge, { backgroundColor: sc.bg }]}>
                    <Ionicons name={sc.icon} size={11} color={sc.text} />
                    <Text style={[st.badgeText, { color: sc.text }]}>{doc.status}</Text>
                  </View>
                </View>

                {doc.status === 'rejected' && doc.rejectionReason && (
                  <View style={st.rejectionBanner}>
                    <Ionicons name="information-circle-outline" size={14} color="#991B1B" />
                    <Text style={st.rejectionText}>{doc.rejectionReason}</Text>
                  </View>
                )}

                <View style={st.cardFooter}>
                  {doc.uploadDate ? <Text style={st.metaText}>Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-GB')}</Text> : null}
                  {doc.expiryDate ? <Text style={[st.metaText, { color: '#F59E0B' }]}>Expires {new Date(doc.expiryDate).toLocaleDateString('en-GB')}</Text> : null}
                  {doc.status === 'rejected' && (
                    <TouchableOpacity style={st.reuploadBtn} onPress={() => openUploadModal(doc.name)}>
                      <Ionicons name="refresh-outline" size={13} color={Colors.primary} />
                      <Text style={st.reuploadText}>Re-upload</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ─── Upload Modal ─────────────────────────────────────────────── */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => !isUploading && setModalVisible(false)}>
        <KeyboardAvoidingView style={st.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={st.modalSheet}>
            {/* Header */}
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Upload Document</Text>
              {!isUploading && (
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Document name */}
              <Text style={st.fieldLabel}>Document Name <Text style={st.required}>*</Text></Text>
              <TextInput
                style={st.textInput}
                placeholder="e.g. Driver's License, TIPS Cert"
                placeholderTextColor={Colors.textMuted}
                value={uploadName}
                onChangeText={setUploadName}
                editable={!isUploading}
              />

              {/* Document type */}
              <Text style={[st.fieldLabel, { marginTop: 14 }]}>Document Type <Text style={st.required}>*</Text></Text>
              <View style={st.categoryGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[st.catChip, uploadCategory === cat.value && st.catChipActive]}
                    onPress={() => !isUploading && setUploadCategory(cat.value)}
                  >
                    <Text style={[st.catText, uploadCategory === cat.value && st.catTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* File picker */}
              <Text style={[st.fieldLabel, { marginTop: 14 }]}>File <Text style={st.required}>*</Text></Text>
              <TouchableOpacity style={st.filePicker} onPress={handlePickFile} disabled={isUploading}>
                <Ionicons name={pickedFile ? 'document-attach-outline' : 'attach-outline'} size={20} color={pickedFile ? Colors.primary : Colors.textSecondary} />
                <Text style={[st.filePickerText, pickedFile && { color: Colors.primary }]} numberOfLines={1}>
                  {pickedFile ? pickedFile.name : 'Choose PDF, JPG, PNG, DOC…'}
                </Text>
                {pickedFile && <Ionicons name="checkmark-circle" size={18} color="#10B981" />}
              </TouchableOpacity>
              {pickedFile?.size && (
                <Text style={st.fileSizeText}>{(pickedFile.size / 1024).toFixed(1)} KB</Text>
              )}

              {/* Progress bar */}
              {isUploading && (
                <View style={st.progressWrap}>
                  <View style={st.progressBg}>
                    <View style={[st.progressFill, { width: `${uploadProgress}%` as any, backgroundColor: Colors.primary }]} />
                  </View>
                  <Text style={st.progressText}>Uploading… {uploadProgress}%</Text>
                </View>
              )}

              {/* Submit button */}
              <TouchableOpacity
                style={[st.submitBtn, (isUploading || !pickedFile || !uploadCategory || !uploadName.trim()) && st.submitBtnDisabled]}
                onPress={handleUpload}
                disabled={isUploading || !pickedFile || !uploadCategory || !uploadName.trim()}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
                    <Text style={st.submitBtnText}>Upload Document</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={st.modalNote}>
                Your document will be reviewed by an admin. You'll receive a notification once it's verified.
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 14 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  complianceCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0' },
  complianceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  complianceTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  compliancePct: { fontSize: 18, fontWeight: '800' },
  progressBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 8, borderRadius: 4 },
  complianceSub: { fontSize: 12, color: Colors.textMuted },

  tabChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  tabChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 13, marginBottom: 14 },
  uploadBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptyHint: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  docIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  cardDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  requiredChip: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  requiredText: { fontSize: 10, fontWeight: '700', color: '#92400E' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' as const },
  rejectionBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF2F2', borderRadius: 6, padding: 8, marginBottom: 8 },
  rejectionText: { fontSize: 12, color: '#991B1B', flex: 1 },
  cardFooter: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  metaText: { fontSize: 12, color: Colors.textMuted },
  reuploadBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, marginLeft: 'auto' },
  reuploadText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 36, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  required: { color: '#EF4444' },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 14, color: Colors.textPrimary, backgroundColor: '#F9FAFB' },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '600' },

  filePicker: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 12, backgroundColor: '#F9FAFB' },
  filePickerText: { flex: 1, fontSize: 14, color: Colors.textSecondary },
  fileSizeText: { fontSize: 11, color: Colors.textMuted, marginTop: 4, marginLeft: 2 },

  progressWrap: { marginTop: 14 },
  progressText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },

  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, marginTop: 20 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  modalNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: 14, lineHeight: 18 },
});
