import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Datos de ejemplo para las tarjetas de alerta
const ALERTS_DATA = [
  {
    id: '8842',
    type: 'CRÍTICA',
    title: 'Descuento Mal Aplicado: Micropolar Kalu',
    location: 'Hites2 Concepción',
    promoter: 'Claudia Bravo',
    comment: '*no esta ingresando con 20% sino...*',
    time: 'Hace 10 min',
  },
  {
    id: '8839',
    type: 'CRÍTICA',
    title: 'Quiebre de Stock: Cinturón',
    location: 'Paris Mall Plaza Trébol',
    promoter: 'Sebastián Moreno',
    time: 'Hace 25 min',
  },
  {
    id: '8829',
    type: 'MODERADA',
    title: 'Error de Etiquetado de Precio',
    location: 'Ripley Mall Plaza Trébol',
    promoter: 'Janio Pérez',
    time: 'Hace 2 horas',
  },
  {
    id: '8820',
    type: 'INFORMATIVA',
    title: 'Llegada mercadería temporada Verano',
    location: 'Falabella Mall Plaza Trébol',
    promoter: 'Sebastián Moreno',
    time: 'Hace 3 horas',
  },
];

export default function AlertCenterScreen() {
  const [selectedFilter, setSelectedFilter] = useState('Todas');

  // helper para definir estilos de la insignia según tipo
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'CRÍTICA':
        return { bg: '#FDE8E8', text: '#E53E3E', icon: 'warning-outline' };
      case 'MODERADA':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' };
      case 'INFORMATIVA':
        return { bg: '#E0F2FE', text: '#0284C7', icon: 'information-circle-outline' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', icon: 'help-circle-outline' };
    }
  };

  const renderAlertCard = ({ item, index }) => {
    const badge = getBadgeStyle(item.type);
    const isFirstCard = index === 0;

    return (
      <View style={[styles.card, isFirstCard && styles.cardHighlight]}>
        {/* Encabezado de la tarjeta */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Ionicons name={badge.icon} size={14} color={badge.text} />
            <Text style={[styles.typeBadgeText, { color: badge.text }]}>
              {item.type} #{item.id}
            </Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>

     
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>
          {item.location} • Promotor: {item.promoter}
        </Text>

  
        {item.comment && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>{item.comment}</Text>
            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>Ver detalle →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Título de la sección */}
        <Text style={styles.mainTitle}>Centro de Alertas</Text>

        {/* Botón Filtro por Zona */}
        <TouchableOpacity style={styles.zoneFilterBtn}>
          <Ionicons name="filter-outline" size={16} color="#0B2545" />
          <Text style={styles.zoneFilterText}>Filtrar por Zona</Text>
          <View style={styles.activeDot} />
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: '#FDE8E8', borderColor: '#F87171' }]}>
            <Text style={[styles.statLabel, { color: '#DC2626' }]}>CRÍTICAS</Text>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>4</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#FEF3C7', borderColor: '#FBBF24' }]}>
            <Text style={[styles.statLabel, { color: '#D97706' }]}>MODERADAS</Text>
            <Text style={[styles.statValue, { color: '#D97706' }]}>5</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#E0F2FE', borderColor: '#60A5FA' }]}>
            <Text style={[styles.statLabel, { color: '#2563EB' }]}>INFORMAT.</Text>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>3</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#DCFCE7', borderColor: '#4ADE80' }]}>
            <Text style={[styles.statLabel, { color: '#16A34A' }]}>RESUELTAS</Text>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>28</Text>
          </View>
        </View>

       
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabChip, styles.tabChipActive]}
            onPress={() => setSelectedFilter('Todas')}>
            <Text style={styles.tabChipActiveText}>Todas (12)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabChip}>
            <Text style={[styles.tabChipText, { color: '#DC2626' }]}>Críticas (4)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabChip}>
            <Text style={[styles.tabChipText, { color: '#D97706' }]}>Moderadas (5)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabChip}>
            <Text style={styles.tabChipText}>Informat...</Text>
          </TouchableOpacity>
        </ScrollView>

        
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="warning-outline" size={18} color="#0B2545" />
            <Text style={styles.sectionTitle}>Alertas recientes</Text>
          </View>
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>4 recientes</Text>
          </View>
        </View>

     
        <FlatList
          data={ALERTS_DATA}
          renderItem={renderAlertCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} 
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0B2545',
    marginBottom: 12,
  },
  zoneFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  zoneFilterText: {
    color: '#0B2545',
    fontSize: 13,
    fontWeight: '600',
    marginHorizontal: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E3A8A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  tabChipActive: {
    backgroundColor: '#0B2545',
    borderColor: '#0B2545',
  },
  tabChipActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  tabChipText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0B2545',
  },
  recentBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHighlight: {
    borderColor: '#0B2545',
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  commentContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    flex: 1,
  },
  detailButton: {
    marginLeft: 8,
  },
  detailButtonText: {
    fontSize: 12,
    color: '#0B2545',
    fontWeight: 'bold',
  },
});