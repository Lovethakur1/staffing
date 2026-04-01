import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { getMyTickets, submitTicket, SupportTicket } from '../services/extraScreens.service';

type SupportTab = 'faq' | 'contact' | 'tickets';

interface FAQ {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQ[] = [
  { category: 'Shifts', q: 'How do I clock in for my shift?', a: 'Open the My Shifts screen, tap your upcoming shift, then tap "Start Shift" to begin the clock-in workflow.' },
  { category: 'Shifts', q: 'What if I arrive late to a shift?', a: 'Clock in as soon as you arrive. Your manager will be notified of any late arrivals automatically.' },
  { category: 'Shifts', q: 'How do I request a shift swap?', a: 'Contact your manager directly via the Messages screen. They will coordinate the swap on your behalf.' },
  { category: 'Payroll', q: 'When do I get paid?', a: 'Payment is processed weekly every Friday. Funds typically arrive within 2-3 business days depending on your bank.' },
  { category: 'Payroll', q: 'How do I view my payslips?', a: 'Navigate to Payroll in the drawer menu. All approved timesheets and payment history are listed there.' },
  { category: 'App', q: 'How do I update my profile information?', a: 'Go to the Profile tab and tap "Edit Profile". Update your details and tap Save.' },
  { category: 'App', q: 'The app is not loading. What should I do?', a: 'Try closing and reopening the app. If the issue persists, check your internet connection and contact support.' },
  { category: 'Documents', q: 'How do I upload a document?', a: 'Go to the Documents section in the drawer menu and tap "Upload Document" to select and submit your file.' },
];

const TICKET_STATUS: Record<string, { bg: string; text: string }> = {
  OPEN:         { bg: '#DBEAFE', text: '#1E40AF' },
  IN_PROGRESS:  { bg: '#FEF3C7', text: '#92400E' },
  RESOLVED:     { bg: '#D1FAE5', text: '#065F46' },
  CLOSED:       { bg: '#F1F5F9', text: '#475569' },
};

const CATEGORIES = ['General Inquiry', 'Shift Issue', 'Payroll Query', 'Technical Problem', 'HR Matter', 'Other'];

export default function HelpSupportScreen() {
  const [tab, setTab] = useState<SupportTab>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async (quiet = false) => {
    if (!quiet) setLoadingTickets(true);
    try { setTickets(await getMyTickets()); } catch {}
    setLoadingTickets(false);
    setRefreshing(false);
  };

  useFocusEffect(useCallback(() => { loadTickets(); }, []));

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Missing fields', 'Please fill in subject and message.');
      return;
    }
    setSubmitting(true);
    try {
      await submitTicket({ subject: subject.trim(), category: category || 'General Inquiry', message: message.trim() });
      Alert.alert('Ticket Submitted', 'Our team will respond within 24 hours.', [
        { text: 'OK', onPress: () => { setSubject(''); setCategory(''); setMessage(''); setTab('tickets'); loadTickets(); } },
      ]);
    } catch {
      Alert.alert('Error', 'Unable to submit ticket. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <ScreenLayout activeTab="Dashboard">
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={st.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTickets(true); }} tintColor={Colors.primary} />}
        >
          <Text style={st.pageTitle}>Help & Support</Text>
          <Text style={st.pageSubtitle}>FAQs, submit tickets and track your requests</Text>

          {/* Stats bar */}
          <View style={st.statsRow}>
            {[
              { label: 'Response Time', value: '< 24h', icon: 'time-outline', color: '#10B981' },
              { label: 'Available', value: '24/7', icon: 'headset-outline', color: '#3B82F6' },
              { label: 'Satisfaction', value: '98%', icon: 'heart-outline', color: Colors.primary },
              { label: 'My Tickets', value: tickets.length, icon: 'ticket-outline', color: '#8B5CF6' },
            ].map(s => (
              <View key={s.label} style={st.statCard}>
                <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                </View>
                <Text style={st.statValue}>{s.value}</Text>
                <Text style={st.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Tabs */}
          <View style={st.tabsRow}>
            {([['faq','FAQs'],['contact','Contact'],['tickets','My Tickets']] as [SupportTab,string][]).map(([key,label]) => (
              <TouchableOpacity key={key} style={[st.tabBtn, tab===key && st.tabBtnActive]} onPress={() => setTab(key)}>
                <Text style={[st.tabText, tab===key && st.tabTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ */}
          {tab === 'faq' && FAQS.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={st.faqCard}
              onPress={() => setExpandedFaq(expandedFaq === i ? null : i)}
              activeOpacity={0.85}
            >
              <View style={st.faqRow}>
                <View style={st.faqCatChip}>
                  <Text style={st.faqCatText}>{faq.category}</Text>
                </View>
                <Text style={st.faqQ} numberOfLines={expandedFaq === i ? undefined : 2}>{faq.q}</Text>
                <Ionicons name={expandedFaq === i ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </View>
              {expandedFaq === i && (
                <View style={st.faqAnswer}>
                  <Text style={st.faqAnswerText}>{faq.a}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Contact / Submit */}
          {tab === 'contact' && (
            <View>
              {/* Support channels */}
              <View style={st.channelsRow}>
                {[
                  { icon: 'chatbubble-outline', label: 'Live Chat', sub: 'Mon–Fri 9am–6pm', color: '#3B82F6' },
                  { icon: 'mail-outline', label: 'Email', sub: 'support@extreme.com', color: '#10B981' },
                  { icon: 'call-outline', label: 'Phone', sub: '+44 20 XXXX XXXX', color: '#F59E0B' },
                ].map(ch => (
                  <View key={ch.label} style={st.channelCard}>
                    <View style={[st.channelIcon, { backgroundColor: ch.color + '18' }]}>
                      <Ionicons name={ch.icon as any} size={20} color={ch.color} />
                    </View>
                    <Text style={st.channelLabel}>{ch.label}</Text>
                    <Text style={st.channelSub}>{ch.sub}</Text>
                  </View>
                ))}
              </View>

              {/* Form */}
              <Text style={st.formTitle}>Submit a Ticket</Text>
              <Text style={st.formLabel}>Subject *</Text>
              <TextInput style={st.textInput} value={subject} onChangeText={setSubject} placeholder="Brief description of your issue" />

              <Text style={st.formLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ paddingRight: 16 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} style={[st.categoryChip, category === cat && st.categoryChipActive]} onPress={() => setCategory(cat)}>
                    <Text style={[st.categoryChipText, category === cat && st.categoryChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={st.formLabel}>Message *</Text>
              <TextInput
                style={[st.textInput, st.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue in detail..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <TouchableOpacity style={[st.submitBtn, submitting && { opacity: 0.6 }]} onPress={handleSubmit} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="send-outline" size={16} color="#fff" />}
                <Text style={st.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Ticket'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* My Tickets */}
          {tab === 'tickets' && (
            loadingTickets ? (
              <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
            ) : tickets.length === 0 ? (
              <View style={st.emptyBox}>
                <Ionicons name="ticket-outline" size={48} color={Colors.textMuted} />
                <Text style={st.emptyText}>No tickets yet</Text>
                <Text style={st.emptySubtext}>Submit a support ticket from the Contact tab</Text>
                <TouchableOpacity style={st.switchBtn} onPress={() => setTab('contact')}>
                  <Text style={st.switchBtnText}>Submit a Ticket</Text>
                </TouchableOpacity>
              </View>
            ) : tickets.map(t => {
              const sc = TICKET_STATUS[t.status] || TICKET_STATUS.OPEN;
              return (
                <View key={t.id} style={st.ticketCard}>
                  <View style={st.ticketTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={st.ticketSubject}>{t.subject}</Text>
                      <Text style={st.ticketCategory}>{t.category}</Text>
                    </View>
                    <View style={[st.badge, { backgroundColor: sc.bg }]}>
                      <Text style={[st.badgeText, { color: sc.text }]}>{t.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                  <Text style={st.ticketMsg} numberOfLines={2}>{t.message}</Text>
                  <Text style={st.ticketDate}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : ''}</Text>
                  {t.resolutionNotes && (
                    <View style={st.resolutionBox}>
                      <Ionicons name="checkmark-circle-outline" size={14} color="#065F46" />
                      <Text style={st.resolutionText}>{t.resolutionNotes}</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const st = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 14 },

  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  faqCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  faqRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  faqCatChip: { backgroundColor: Colors.primary + '12', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  faqCatText: { fontSize: 10, fontWeight: '700', color: Colors.primary },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 20 },
  faqAnswer: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  faqAnswerText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  channelsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  channelCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  channelIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  channelLabel: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary },
  channelSub: { fontSize: 10, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  formTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6 },
  textInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 12, fontSize: 14, color: Colors.textPrimary, marginBottom: 12 },
  textArea: { height: 120, textAlignVertical: 'top' },
  categoryChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', marginRight: 8 },
  categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  categoryChipTextActive: { color: '#fff' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 10, paddingVertical: 13 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  switchBtn: { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 24, paddingVertical: 11 },
  switchBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  ticketCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  ticketTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  ticketSubject: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  ticketCategory: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  ticketMsg: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginBottom: 6 },
  ticketDate: { fontSize: 11, color: Colors.textMuted },
  resolutionBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#D1FAE5', borderRadius: 6, padding: 8, marginTop: 8 },
  resolutionText: { fontSize: 12, color: '#065F46', flex: 1 },
});
