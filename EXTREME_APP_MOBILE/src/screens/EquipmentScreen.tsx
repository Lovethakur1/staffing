import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../components';
import { Colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

// ─── Types ──────────────────────────────────────────────────────
interface EquipItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStock: number;
  unit: string;
  cost: number;
  location?: string;
  notes?: string;
  status?: string;
}

interface Assignment {
  id: string;
  itemId: string;
  item?: { id: string; name: string; unit: string };
  staffId: string;
  staffName: string;
  quantity: number;
  assignedDate: string;
  returnDate?: string;
  status: 'checked-out' | 'returned' | 'damaged' | 'lost';
  notes?: string;
}

// ─── Status configs ─────────────────────────────────────────────
const ASSIGN_STATUS: Record<string, { bg: string; text: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  'checked-out': { bg: '#DBEAFE', text: '#1E40AF', icon: 'arrow-forward-circle-outline', label: 'Checked Out' },
  'returned':    { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle-outline',     label: 'Returned' },
  'damaged':     { bg: '#FEF3C7', text: '#92400E', icon: 'warning-outline',              label: 'Damaged' },
  'lost':        { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle-outline',         label: 'Lost' },
};

const STOCK_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  'in-stock':     { bg: '#D1FAE5', text: '#065F46', label: 'In Stock' },
  'low-stock':    { bg: '#FEF3C7', text: '#92400E', label: 'Low Stock' },
  'out-of-stock': { bg: '#FEE2E2', text: '#991B1B', label: 'Out of Stock' },
};

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  uniform: 'shirt-outline',
  equipment: 'construct-outline',
  supplies: 'cube-outline',
};

// ─── Main Screen ────────────────────────────────────────────────
export default function EquipmentScreen() {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';
  const staffProfileId = user?.staffProfile?.id;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(isManager ? 'inventory' : 'active');

  // Data
  const [inventory, setInventory] = useState<EquipItem[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);
  const [staffList, setStaffList] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Assign modal
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ itemId: '', staffId: '', quantity: '1', notes: '' });
  const [saving, setSaving] = useState(false);
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      if (isManager) {
        const [itemsRes, myRes, allRes] = await Promise.all([
          api.get('/equipment', { params: { limit: 500 } }),
          staffProfileId ? api.get('/equipment/assignments', { params: { staffId: staffProfileId } }) : Promise.resolve({ data: { data: [] } }),
          api.get('/equipment/assignments'),
        ]);
        setInventory(itemsRes.data?.data || []);
        setMyAssignments(myRes.data?.data || []);
        setAllAssignments(allRes.data?.data || []);
      } else {
        const res = await api.get('/equipment/assignments');
        setMyAssignments(res.data?.data || []);
      }
    } catch (err) {
      console.error('Equipment load error:', err);
    }
    setLoading(false);
    setRefreshing(false);
  }, [isManager, staffProfileId]);

  // Fetch staff list for manager assign modal
  const loadStaff = useCallback(async () => {
    if (!isManager) return;
    try {
      const res = await api.get('/staff', { params: { take: 200 } });
      const list = res.data?.data || res.data || [];
      setStaffList(list.map((s: any) => ({
        id: s.id,
        name: s.user?.name || s.name || s.id,
      })));
    } catch {}
  }, [isManager]);

  useFocusEffect(useCallback(() => { load(); loadStaff(); }, [load, loadStaff]));

  // ─── Stats ──────────────────────────────────────────────────
  const myActive = myAssignments.filter(a => a.status === 'checked-out');
  const myReturned = myAssignments.filter(a => a.status === 'returned');
  const myDamagedLost = myAssignments.filter(a => a.status === 'damaged' || a.status === 'lost');

  const staffStats = [
    { label: 'Checked Out', value: myActive.length, color: '#3B82F6', icon: 'arrow-forward-circle-outline' },
    { label: 'Returned', value: myReturned.length, color: '#10B981', icon: 'checkmark-circle-outline' },
    { label: 'Damaged/Lost', value: myDamagedLost.length, color: '#EF4444', icon: 'warning-outline' },
  ];

  const mgrStats = [
    { label: 'Items', value: inventory.length, color: '#3B82F6', icon: 'cube-outline' },
    { label: 'Low Stock', value: inventory.filter(i => i.status === 'low-stock').length, color: '#F59E0B', icon: 'trending-down-outline' },
    { label: 'Out', value: inventory.filter(i => i.status === 'out-of-stock').length, color: '#EF4444', icon: 'close-circle-outline' },
    { label: 'Assigned', value: allAssignments.filter(a => a.status === 'checked-out').length, color: '#8B5CF6', icon: 'people-outline' },
  ];

  // ─── Handlers ───────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignForm.itemId || !assignForm.staffId) {
      Alert.alert('Error', 'Select an item and staff member');
      return;
    }
    const qty = Math.max(1, parseInt(assignForm.quantity) || 1);
    const item = inventory.find(i => i.id === assignForm.itemId);
    if (item && qty > item.quantity) {
      Alert.alert('Error', `Only ${item.quantity} ${item.unit} available`);
      return;
    }
    const staff = staffList.find(s => s.id === assignForm.staffId);
    setSaving(true);
    try {
      await api.post('/equipment/assignments', {
        itemId: assignForm.itemId,
        staffId: assignForm.staffId,
        staffName: staff?.name || '',
        quantity: qty,
        notes: assignForm.notes,
      });
      Alert.alert('Success', `${item?.name} assigned to ${staff?.name}`);
      setShowAssign(false);
      setAssignForm({ itemId: '', staffId: '', quantity: '1', notes: '' });
      load(true);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || 'Failed to assign item');
    }
    setSaving(false);
  };

  const handleStatusUpdate = (assignment: Assignment, newStatus: string) => {
    const label = newStatus === 'returned' ? 'Return' : newStatus === 'damaged' ? 'Damaged' : 'Lost';
    Alert.alert(`Mark as ${label}?`, `${assignment.item?.name || 'Item'} (${assignment.quantity} units) from ${assignment.staffName}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: label, style: newStatus === 'returned' ? 'default' : 'destructive',
        onPress: async () => {
          try {
            await api.put(`/equipment/assignments/${assignment.id}`, { status: newStatus });
            load(true);
          } catch {
            Alert.alert('Error', 'Failed to update assignment');
          }
        },
      },
    ]);
  };

  // ─── Render helpers ─────────────────────────────────────────
  const renderBadge = (statusKey: string, config: Record<string, { bg: string; text: string; label: string; icon?: keyof typeof Ionicons.glyphMap }>) => {
    const sc = config[statusKey] || { bg: '#F1F5F9', text: '#475569', label: statusKey };
    return (
      <View style={[st.badge, { backgroundColor: sc.bg }]}>
        {'icon' in sc && sc.icon && <Ionicons name={sc.icon as any} size={11} color={sc.text} />}
        <Text style={[st.badgeText, { color: sc.text }]}>{sc.label}</Text>
      </View>
    );
  };

  const renderAssignmentCard = (a: Assignment, showStaff = false, showActions = false) => {
    const sc = ASSIGN_STATUS[a.status] || ASSIGN_STATUS['checked-out'];
    return (
      <View key={a.id} style={st.card}>
        <View style={st.cardTop}>
          <View style={[st.itemIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="cube-outline" size={20} color="#1E40AF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.cardTitle}>{a.item?.name || 'Unknown Item'}</Text>
            <Text style={st.cardSub}>Qty: {a.quantity} {a.item?.unit || 'pcs'}</Text>
          </View>
          <View style={[st.badge, { backgroundColor: sc.bg }]}>
            <Ionicons name={sc.icon} size={11} color={sc.text} />
            <Text style={[st.badgeText, { color: sc.text }]}>{sc.label}</Text>
          </View>
        </View>
        <View style={st.detailsRow}>
          {showStaff && (
            <View style={st.detailChip}>
              <Ionicons name="person-outline" size={12} color={Colors.textSecondary} />
              <Text style={st.detailText}>{a.staffName}</Text>
            </View>
          )}
          <View style={st.detailChip}>
            <Ionicons name="calendar-outline" size={12} color={Colors.textSecondary} />
            <Text style={st.detailText}>{new Date(a.assignedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>
          {a.returnDate && (
            <View style={st.detailChip}>
              <Ionicons name="arrow-back-outline" size={12} color={Colors.textSecondary} />
              <Text style={st.detailText}>{new Date(a.returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            </View>
          )}
        </View>
        {a.notes ? <Text style={st.noteText}>{a.notes}</Text> : null}
        {showActions && a.status === 'checked-out' && (
          <View style={st.actionsRow}>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#D1FAE5' }]} onPress={() => handleStatusUpdate(a, 'returned')}>
              <Ionicons name="checkmark-circle-outline" size={14} color="#065F46" />
              <Text style={[st.actionText, { color: '#065F46' }]}>Return</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#FEF3C7' }]} onPress={() => handleStatusUpdate(a, 'damaged')}>
              <Ionicons name="warning-outline" size={14} color="#92400E" />
              <Text style={[st.actionText, { color: '#92400E' }]}>Damaged</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[st.actionBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => handleStatusUpdate(a, 'lost')}>
              <Ionicons name="close-circle-outline" size={14} color="#991B1B" />
              <Text style={[st.actionText, { color: '#991B1B' }]}>Lost</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderInventoryCard = (item: EquipItem) => {
    const stockSt = STOCK_STATUS[item.status || 'in-stock'] || STOCK_STATUS['in-stock'];
    const catIcon = CATEGORY_ICONS[item.category] || 'cube-outline';
    return (
      <View key={item.id} style={st.card}>
        <View style={st.cardTop}>
          <View style={[st.itemIcon, { backgroundColor: Colors.primary + '18' }]}>
            <Ionicons name={catIcon} size={20} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.cardTitle}>{item.name}</Text>
            <Text style={st.cardSub}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)} · {item.sku}</Text>
          </View>
          <View style={[st.badge, { backgroundColor: stockSt.bg }]}>
            <Text style={[st.badgeText, { color: stockSt.text }]}>{stockSt.label}</Text>
          </View>
        </View>
        <View style={st.detailsRow}>
          <View style={st.detailChip}>
            <Text style={st.detailLabel}>Stock</Text>
            <Text style={[st.detailText, item.quantity <= item.minStock && { color: '#F59E0B', fontWeight: '700' }]}>
              {item.quantity} / {item.minStock} {item.unit}
            </Text>
          </View>
          {item.location ? (
            <View style={st.detailChip}>
              <Ionicons name="location-outline" size={12} color={Colors.textSecondary} />
              <Text style={st.detailText}>{item.location}</Text>
            </View>
          ) : null}
          <View style={st.detailChip}>
            <Text style={st.detailLabel}>Cost</Text>
            <Text style={st.detailText}>${item.cost.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // ─── Tabs ───────────────────────────────────────────────────
  const staffTabs: [string, string][] = [['active', 'Active'], ['history', 'History']];
  const mgrTabs: [string, string][] = [['inventory', 'Inventory'], ['mygear', 'My Gear'], ['all', 'All Assignments']];
  const tabs = isManager ? mgrTabs : staffTabs;

  // Filter data per tab
  const getTabContent = () => {
    if (tab === 'active') return myActive;
    if (tab === 'history') return [...myReturned, ...myDamagedLost];
    if (tab === 'mygear') return myAssignments;
    if (tab === 'all') return allAssignments;
    if (tab === 'inventory') {
      const q = searchQuery.toLowerCase();
      if (!q) return inventory;
      return inventory.filter(i =>
        i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || (i.location || '').toLowerCase().includes(q)
      );
    }
    return [];
  };

  const selectedItem = inventory.find(i => i.id === assignForm.itemId);
  const selectedStaff = staffList.find(s => s.id === assignForm.staffId);

  // ─── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <ScreenLayout activeTab="Equipment">
        <View style={st.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout activeTab="Equipment">
      <ScrollView
        contentContainerStyle={st.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <Text style={st.pageTitle}>{isManager ? 'Equipment & Inventory' : 'My Equipment'}</Text>
        <Text style={st.pageSubtitle}>
          {isManager ? 'Manage inventory and staff assignments' : 'Your assigned equipment and gear'}
        </Text>

        {/* Stats Row */}
        <View style={st.statsRow}>
          {(isManager ? mgrStats : staffStats).map(s => (
            <View key={s.label} style={st.statCard}>
              <View style={[st.statIcon, { backgroundColor: s.color + '18' }]}>
                <Ionicons name={s.icon as any} size={16} color={s.color} />
              </View>
              <Text style={st.statValue}>{s.value}</Text>
              <Text style={st.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Manager: Assign button */}
        {isManager && (
          <TouchableOpacity
            style={st.assignBtn}
            onPress={() => setShowAssign(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={st.assignBtnText}>Assign Equipment to Staff</Text>
          </TouchableOpacity>
        )}

        {/* Tabs */}
        <View style={st.tabsRow}>
          {tabs.map(([key, label]) => (
            <TouchableOpacity key={key} style={[st.tabBtn, tab === key && st.tabBtnActive]} onPress={() => setTab(key)}>
              <Text style={[st.tabText, tab === key && st.tabTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search (inventory tab only) */}
        {tab === 'inventory' && (
          <View style={st.searchWrap}>
            <Ionicons name="search-outline" size={16} color={Colors.textMuted} style={{ marginLeft: 10 }} />
            <TextInput
              style={st.searchInput}
              placeholder="Search items, SKU, location..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
                <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Content */}
        {(() => {
          const data = getTabContent();
          if (!data || data.length === 0) {
            const emptyIcon: keyof typeof Ionicons.glyphMap =
              tab === 'inventory' ? 'cube-outline' : 'construct-outline';
            const emptyMsg =
              tab === 'inventory' ? 'No inventory items found'
              : tab === 'active' ? 'No equipment currently checked out'
              : tab === 'mygear' ? 'No equipment assigned to you'
              : tab === 'all' ? 'No assignments found'
              : 'No assignment history';
            return (
              <View style={st.emptyBox}>
                <Ionicons name={emptyIcon} size={48} color={Colors.textMuted} />
                <Text style={st.emptyText}>{emptyMsg}</Text>
              </View>
            );
          }

          if (tab === 'inventory') {
            return (data as EquipItem[]).map(item => renderInventoryCard(item));
          }

          const showStaff = isManager && (tab === 'all');
          const showActions = isManager && (tab === 'all');
          return (data as Assignment[]).map(a => renderAssignmentCard(a, showStaff, showActions));
        })()}
      </ScrollView>

      {/* ─── Assign Equipment Modal ─────────────────────────────── */}
      <Modal visible={showAssign} transparent animationType="fade" onRequestClose={() => setShowAssign(false)}>
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Assign Equipment</Text>
              <TouchableOpacity onPress={() => setShowAssign(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Item Picker */}
            <Text style={st.fieldLabel}>Item *</Text>
            <TouchableOpacity style={st.pickerBtn} onPress={() => setShowItemPicker(true)}>
              <Text style={selectedItem ? st.pickerText : st.pickerPlaceholder}>
                {selectedItem ? `${selectedItem.name} (${selectedItem.quantity} ${selectedItem.unit})` : 'Select item...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Staff Picker */}
            <Text style={st.fieldLabel}>Staff Member *</Text>
            <TouchableOpacity style={st.pickerBtn} onPress={() => setShowStaffPicker(true)}>
              <Text style={selectedStaff ? st.pickerText : st.pickerPlaceholder}>
                {selectedStaff ? selectedStaff.name : 'Select staff...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={Colors.textMuted} />
            </TouchableOpacity>

            {/* Quantity */}
            <Text style={st.fieldLabel}>Quantity</Text>
            <TextInput
              style={st.input}
              keyboardType="numeric"
              value={assignForm.quantity}
              onChangeText={t => setAssignForm(f => ({ ...f, quantity: t }))}
            />

            {/* Notes */}
            <Text style={st.fieldLabel}>Notes (optional)</Text>
            <TextInput
              style={[st.input, { height: 60, textAlignVertical: 'top' }]}
              multiline
              value={assignForm.notes}
              onChangeText={t => setAssignForm(f => ({ ...f, notes: t }))}
              placeholder="Any notes..."
              placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
              style={[st.submitBtn, saving && { opacity: 0.6 }]}
              onPress={handleAssign}
              disabled={saving}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={st.submitBtnText}>{saving ? 'Assigning...' : 'Assign'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Item Picker Modal ──────────────────────────────────── */}
      <Modal visible={showItemPicker} transparent animationType="slide" onRequestClose={() => setShowItemPicker(false)}>
        <View style={st.modalOverlay}>
          <View style={[st.modalContent, { maxHeight: '70%' }]}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Select Item</Text>
              <TouchableOpacity onPress={() => setShowItemPicker(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={inventory.filter(i => i.quantity > 0)}
              keyExtractor={i => i.id}
              renderItem={({ item: i }) => (
                <TouchableOpacity
                  style={[st.pickerItem, assignForm.itemId === i.id && st.pickerItemActive]}
                  onPress={() => { setAssignForm(f => ({ ...f, itemId: i.id })); setShowItemPicker(false); }}
                >
                  <Ionicons name={CATEGORY_ICONS[i.category] || 'cube-outline'} size={18} color={Colors.primary} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={st.pickerItemTitle}>{i.name}</Text>
                    <Text style={st.pickerItemSub}>{i.quantity} {i.unit} available · {i.sku}</Text>
                  </View>
                  {assignForm.itemId === i.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={st.emptyPickerText}>No items with stock available</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* ─── Staff Picker Modal ─────────────────────────────────── */}
      <Modal visible={showStaffPicker} transparent animationType="slide" onRequestClose={() => setShowStaffPicker(false)}>
        <View style={st.modalOverlay}>
          <View style={[st.modalContent, { maxHeight: '70%' }]}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Select Staff</Text>
              <TouchableOpacity onPress={() => setShowStaffPicker(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={staffList}
              keyExtractor={s => s.id}
              renderItem={({ item: s }) => (
                <TouchableOpacity
                  style={[st.pickerItem, assignForm.staffId === s.id && st.pickerItemActive]}
                  onPress={() => { setAssignForm(f => ({ ...f, staffId: s.id })); setShowStaffPicker(false); }}
                >
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                  <Text style={[st.pickerItemTitle, { flex: 1, marginLeft: 10 }]}>{s.name}</Text>
                  {assignForm.staffId === s.id && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={st.emptyPickerText}>No staff found</Text>}
            />
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

// ─── Styles ─────────────────────────────────────────────────────
const st = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, marginTop: 16 },
  pageSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 14 },

  // Stats
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  statCard: { flex: 1, minWidth: 70, backgroundColor: '#fff', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  statIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 9, color: Colors.textMuted, marginTop: 2, textAlign: 'center' },

  // Assign button
  assignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, marginBottom: 14 },
  assignBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  // Tabs
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14, height: 40 },
  searchInput: { flex: 1, paddingHorizontal: 8, fontSize: 14, color: Colors.textPrimary },

  // Cards
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  itemIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  detailLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600' },
  detailText: { fontSize: 12, color: Colors.textPrimary, fontWeight: '600' },
  noteText: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 6 },

  // Actions (manager)
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  actionText: { fontSize: 12, fontWeight: '600' },

  // Empty
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, marginBottom: 6, marginTop: 12 },
  pickerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11 },
  pickerText: { fontSize: 14, color: Colors.textPrimary },
  pickerPlaceholder: { fontSize: 14, color: Colors.textMuted },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.textPrimary },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 13, borderRadius: 10, marginTop: 20 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  // Picker modal items
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerItemActive: { backgroundColor: Colors.primary + '0D' },
  pickerItemTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  pickerItemSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  emptyPickerText: { textAlign: 'center', color: Colors.textMuted, paddingVertical: 40, fontSize: 14 },
});
