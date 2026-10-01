import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Actions, Bubble, GiftedChat, IMessage, InputToolbar, InputToolbarProps, Send, SendProps, User } from 'react-native-gifted-chat';

interface CustomMessage extends IMessage {
  reportTitle?: string;
  reportSubtitle?: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const router = useRouter();

  const USER_ME: User = { _id: 1, name: 'Sebastian' };
  const COORDINATOR_USER: User = { 
    _id: 2, 
    name: 'Coordinador', 
    avatar: 'https://unsplash.com' 
  };

  useEffect(() => {
    setMessages([
      {
        _id: 3,
        text: 'Hola jefe, voy a acercarme cuando haga el cambio de tienda, gracias por avisarme. Le envio la fotografia.',
        createdAt: new Date(),
        user: USER_ME,
      },
      {
        _id: 2,
        image: 'https://unsplash.com', 
        reportTitle: 'Reporte diario',
        reportSubtitle: 'Falabella Mall Plaza Trebol',
        createdAt: new Date(),
        user: USER_ME,
      },
      {
        _id: 1,
        text: 'Buenos dias Sebastian, necesito que vayas a la tienda MAUI de Mall plaza trebol para ir a buscar P.O.P de temporada otoño/invierno. Podrias enviarme una fotografia del punto actual de Falabella?',
        createdAt: new Date(),
        user: COORDINATOR_USER,
      },
    ]);
  }, []);

  const onSend = useCallback((newMessages: CustomMessage[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));
  }, []);

  const renderBubble = (props: any) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: { backgroundColor: '#00669B', borderRadius: 15, padding: 4 },
          left: { backgroundColor: '#D1E4F6', borderRadius: 15, padding: 4 },
        }}
        textStyle={{
          right: { color: '#FFFFFF', fontSize: 13, lineHeight: 18 },
          left: { color: '#333333', fontSize: 13, lineHeight: 18 },
        }}
      />
    );
  };

  const renderCustomView = (props: any) => {
    const { currentMessage } = props;
    if (currentMessage.reportTitle) {
      return (
        <View style={styles.reportFooter}>
          <View style={styles.iconContainer}>
            <Text style={{ fontSize: 18, color: '#00669B' }}>📄</Text>
          </View>
          <View style={styles.reportTextContainer}>
            <Text style={styles.reportTitle}>{currentMessage.reportTitle}</Text>
            <Text style={styles.reportSubtitle}>{currentMessage.reportSubtitle}</Text>
          </View>
          <View style={styles.checkmarkContainer}>
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>✓</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  // 1. Personalizar por completo la barra de entrada del Mockup
  const renderInputToolbar = (props: InputToolbarProps<IMessage>) => {
    return (
      <View style={styles.footerContainer}>
        {/* Barra ovalada principal */}
        <InputToolbar
          {...props}
          containerStyle={styles.inputToolbarCustom}
          primaryState={props.primaryState}
        />
        
        {/* 2. Botones Rápidos Inferiores */}
        <View style={styles.quickButtonsContainer}>
          <TouchableOpacity 
            onPress={() => router.push('/histoChat')} 
            style={styles.quickButton}
          >
            <Text style={styles.quickButtonText}>Historial de chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>Archivos multimedia</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Botón izquierdo (+) dentro de la barra
  const renderActions = (props: any) => {
    return (
      <Actions
        {...props}
        containerStyle={styles.actionsContainer}
        icon={() => <Text style={styles.plusIcon}>⊕</Text>}
        onPressActionButton={() => console.log('Acción extra')}
      />
    );
  };

  // Botón derecho (Emoji + Enviar) dentro de la barra
  const renderSend = (props: SendProps<IMessage>) => {
    return (
      <View style={styles.rightActionsRow}>
        <TouchableOpacity style={styles.emojiButton}>
          <Text style={styles.emojiIcon}>☺</Text>
        </TouchableOpacity>
        <Send {...props} containerStyle={styles.sendContainer}>
          <View style={styles.sendButtonCircle}>
            <Text style={styles.sendArrow}>➤</Text>
          </View>
        </Send>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.chatWrapper}>
        <GiftedChat
          messages={messages}
          onSend={(messages) => onSend(messages)}
          user={USER_ME}
          renderBubble={renderBubble}
          renderCustomView={renderCustomView}
          renderInputToolbar={renderInputToolbar}
          renderActions={renderActions}
          renderSend={renderSend}
          placeholder="Escribe tu consulta aquí..."
          alwaysShowSend={true}
          showUserAvatar={true}
          renderUsernameOnMessage={true}
          textInputStyle={styles.textInputStyle}
          minInputToolbarHeight={120} // Espacio extra asignado para contener los botones inferiores
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  chatWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Contenedor general que acopla la barra y los sub-botones
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  // Diseño de cápsula ovalada para el input
  inputToolbarCustom: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: '#D4E2F0',
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: 'transparent',
  },
  textInputStyle: {
    color: '#333333',
    fontSize: 14,
    marginLeft: 0,
    paddingTop: 8,
  },
  actionsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 0,
  },
  plusIcon: {
    fontSize: 22,
    color: '#7C93A8',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  emojiButton: {
    marginRight: 8,
    justifyContent: 'center',
  },
  emojiIcon: {
    fontSize: 22,
    color: '#7C93A8',
  },
  sendContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0A3773', // Azul oscuro idéntico al círculo del mockup
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    transform: [{ rotate: '-15deg' }], // Ligera inclinación estética de la flecha
    marginLeft: 2,
  },
  // Estructura de los botones flotantes inferiores
  quickButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  quickButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E2F0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  quickButtonText: {
    color: '#4A5B6D',
    fontSize: 13,
    fontWeight: '500',
  },
  // Tarjeta superior de reportes del primer mockup
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1E4F6',
    padding: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: -5, 
    width: 250,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reportTextContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00669B',
  },
  reportSubtitle: {
    fontSize: 10,
    color: '#555555',
  },
  checkmarkContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
});
