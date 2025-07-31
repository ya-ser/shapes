import React, { useState } from 'react';
import FileSystem from './FileSystem';
import StatusBar from './StatusBar';
import Modal from './Modal';

const Terminal = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const openFile = (fileName) => {
    const fileContents = {
      home: `╔═══════════════════════════════════════════════════════════════╗
║                        FILE: HOME.txt                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  SHAPES is an experimental community protocol exploring       ║
║  collective ritual technologies for healing and connection.   ║
║                                                               ║
║  We gather to practice new forms of care, to experiment      ║
║  with communal rituals, and to archive methods of being      ║
║  together that feel both ancient and futuristic.            ║
║                                                               ║
║  STATUS: Currently active in Toronto, Ontario                ║
║  NEXT_GATHERING: Loading...                                  ║
║                                                               ║
║  > To participate, access CONTACT.sys                        ║
║  > To understand our methods, read CODEBOOK.md               ║
║  > To see past experiments, browse RITUAL_ARCHIVE/           ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`,
      
      ritual: `╔═══════════════════════════════════════════════════════════════╗
║                   FILE: RITUAL_ARCHIVE/                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ARCHIVED EXPERIMENTS:                                        ║
║                                                               ║
║  ┌─ SHAPES == _HOME ──────────────────────────────────────┐   ║
║  │ DATE: 2025.06.15                                       │   ║
║  │ PARTICIPANTS: 23                                       │   ║
║  │ PROTOCOL: Collective movement for domestic space       │   ║
║  │ STATUS: ARCHIVED                                       │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║  ┌─ SHAPES == _MIRROR ─────────────────────────────────────┐   ║
║  │ DATE: 2025.05.22                                       │   ║
║  │ PARTICIPANTS: 31                                       │   ║
║  │ PROTOCOL: Reflection rituals for self-recognition      │   ║
║  │ STATUS: ARCHIVED                                       │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║  ┌─ SHAPES == _CARE ───────────────────────────────────────┐   ║
║  │ DATE: 2025.04.18                                       │   ║
║  │ PARTICIPANTS: 19                                       │   ║
║  │ PROTOCOL: Healing practices for community              │   ║
║  │ STATUS: ARCHIVED                                       │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`,
      
      upcoming: `╔═══════════════════════════════════════════════════════════════╗
║                     FILE: UPCOMING.log                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  LOADING FUTURE PROTOCOLS...                                  ║
║                                                               ║
║  [████████░░] 80% COMPLETE                                    ║
║                                                               ║
║  ┌─ SHAPES == _RITUAL ────────────────────────────────────┐   ║
║  │ DATE: 2025.08.15                                       │   ║
║  │ LOCATION: [LOADING...]                                 │   ║
║  │ CAPACITY: 25 PARTICIPANTS                              │   ║
║  │ PROTOCOL: Sacred technologies for collective healing   │   ║
║  │ STATUS: PREPARATION_PHASE                              │   ║
║  └─────────────────────────────────────────────────────────┘   ║
║                                                               ║
║  REGISTRATION: Access CONTACT.sys for details                ║
║                                                               ║
║  WARNING: Experimental protocol. Participation requires      ║
║  openness to unknown forms of community interaction.         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`,
      
      codebook: `╔═══════════════════════════════════════════════════════════════╗
║                      FILE: CODEBOOK.md                       ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  SHAPES PROTOCOL DEFINITIONS:                                 ║
║                                                               ║
║  RITUAL (n.): Structured collective action designed to       ║
║  create meaning, connection, and transformation through       ║
║  shared experience and repetition.                           ║
║                                                               ║
║  COMMUNITY (n.): Network of individuals choosing to          ║
║  practice care, mutual aid, and creative collaboration       ║
║  beyond traditional social structures.                       ║
║                                                               ║
║  CARE (v.): Active practice of attending to collective       ║
║  and individual wellbeing through presence, listening,       ║
║  and responsive action.                                      ║
║                                                               ║
║  SHAPES (n.): Variable form that can be instantiated         ║
║  with different values, creating new possibilities for       ║
║  collective experience and social healing.                   ║
║                                                               ║
║  PROTOCOL (n.): Documented method for facilitating          ║
║  group experiences that can be replicated, adapted,         ║
║  and evolved by other communities.                           ║
║                                                               ║
║  ARCHIVE (n.): Living repository of collective memory        ║
║  and experimental documentation for future reference         ║
║  and iteration.                                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`,
      
      contact: `╔═══════════════════════════════════════════════════════════════╗
║                     FILE: CONTACT.sys                        ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  [DECRYPTION IN PROGRESS...]                                  ║
║                                                               ║
║  ████████████████████████████████░░░░░░░░░░ 75%              ║
║                                                               ║
║  SIGNAL_CHANNELS:                                             ║
║  ├─ EMAIL: hello@shapes.community                            ║
║  ├─ INSTAGRAM: @shapes.toronto                               ║
║  └─ SIGNAL: [ENCRYPTED_KEY_REQUIRED]                         ║
║                                                               ║
║  TO_PARTICIPATE:                                              ║
║  > Send message with subject: "SHAPES == _JOIN"              ║
║  > Include: Your intention for community ritual              ║
║  > Include: Any accessibility needs or concerns              ║
║                                                               ║
║  TO_COLLABORATE:                                              ║
║  > Send message with subject: "SHAPES == _CONTRIBUTE"        ║
║  > Include: Your skills/offerings for collective work       ║
║                                                               ║
║  RESPONSE_TIME: 3-5 earth_days                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝`
    };

    setModalContent(fileContents[fileName] || 'File not found');
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