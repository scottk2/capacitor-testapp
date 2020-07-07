import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonMenuButton,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import React from 'react';

const Camera: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Camera</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent></IonContent>
    </IonPage>
  );
};

export default Camera;
