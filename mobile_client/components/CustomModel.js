import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { modalStyles } from '../styles/ModalStyles';

const CustomModal = ({ modalVisible, setModalVisible, modalText, color }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(!modalVisible);
            }}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalText}>{modalText}</Text>
                    <TouchableOpacity
                        style={[modalStyles.button, { backgroundColor: color }]}
                        onPress={() => setModalVisible(!modalVisible)}
                    >
                        <Text style={modalStyles.textStyleModal}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};


export default CustomModal;
