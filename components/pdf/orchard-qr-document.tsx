"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Sarabun',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@5.0.12/files/sarabun-thai-400-normal.woff'
});

Font.register({
  family: 'SarabunBold',
  src: 'https://cdn.jsdelivr.net/npm/@fontsource/sarabun@5.0.12/files/sarabun-thai-700-normal.woff'
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#ffffff',
    fontFamily: 'Sarabun',
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  card: {
    width: '48%', // 2 cards per row approx
    height: 180,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    position: 'relative'
  },
  qrSection: {
    width: 110,
    height: 110,
    marginRight: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #f1f5f9',
    borderRadius: 8
  },
  qrImage: {
    width: 100,
    height: 100,
  },
  infoSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  orchardName: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 6,
  },
  treeCode: {
    fontSize: 32,
    fontFamily: 'SarabunBold',
    color: '#0f172a',
    marginBottom: 4,
  },
  treeDetails: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 2,
  },
  plantedDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  zoneBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: 10,
    padding: '6 12',
    borderRadius: 12,
    minWidth: 50,
    textAlign: 'center'
  },
  logo: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40, 
    height: 20, // Approximate aspect ratio, will fit object-contain usually if supported, or manual sizing
    objectFit: 'contain',
    opacity: 0.8
  }
});

interface OrchardQRDocumentProps {
  trees: {
    code: string;
    type: string;
    variety: string;
    zone: string;
    plantedDate?: string;
    url: string; 
    qrDataUrl?: string; 
  }[];
  orchardName: string;
  logoUrl?: string;
}

export const OrchardQRDocument = ({ trees, orchardName, logoUrl }: OrchardQRDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.grid}>
        {trees.map((tree, index) => (
          <View key={index} style={styles.card} wrap={false}>
            {/* Zone Badge */}
            <Text style={styles.zoneBadge}>Zone {tree.zone}</Text>
            
            {/* Left: QR */}
            <View style={styles.qrSection}>
              {tree.qrDataUrl ? (
                <Image src={tree.qrDataUrl} style={styles.qrImage} />
              ) : (
                <Text style={{fontSize: 8}}>QR</Text>
              )}
            </View>

            {/* Right: Info */}
            <View style={styles.infoSection}>
              <Text style={styles.orchardName}>{orchardName}</Text>
              <Text style={styles.treeCode}>{tree.code}</Text>
              <Text style={styles.treeDetails}>{tree.type}</Text>
              <Text style={styles.treeDetails}>{tree.variety}</Text>
              {tree.plantedDate && (
                  <Text style={styles.plantedDate}>Planted: {tree.plantedDate}</Text>
              )}
            </View>

            {/* Brand/Logo */}
            {logoUrl ? (
                 <Image src={logoUrl} style={styles.logo} />
            ) : (
                 <Text style={{...styles.logo, fontSize: 10, width: 'auto', height: 'auto'}}>Clurian</Text>
            )}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
