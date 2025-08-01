import React, { useState } from 'react';
import FileSystem from './FileSystem';
import StatusBar from './StatusBar';
import Modal from './Modal';
import { getFileByKey } from '../data/fileContent';

const Terminal = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const openFile = (fileName) => {
        const fileData = getFileByKey(fileName);
        setModalContent(fileData ? fileData.content : 'File not found');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    return (
        <div className="terminal">
            <FileSystem onFileClick={openFile} />
            <StatusBar />
            <Modal
                isOpen={modalOpen}
                content={modalContent}
                onClose={closeModal}
            />
        </div>
    );
};

export default Terminal;