import React from 'react';

const FileSystem = ({ onFileClick }) => {
  const files = [
    {
      name: 'drwxr-xr-x  HOME.txt',
      status: '[████████░░] 100% loaded',
      progress: 100,
      key: 'home'
    },
    {
      name: 'drwxr-xr-x  RITUAL_ARCHIVE/',
      status: '[████████▒▒] 80% accessed',
      progress: 80,
      key: 'ritual'
    },
    {
      name: 'drwxr-xr-x  UPCOMING.log',
      status: '[██▒▒▒▒▒▒▒▒] 20% preview',
      progress: 20,
      key: 'upcoming'
    },
    {
      name: 'drwxr-xr-x  CODEBOOK.md',
      status: '[██████████] 100% available',
      progress: 100,
      key: 'codebook'
    },
    {
      name: '-rw-r--r--  CONTACT.sys',
      status: '[▒▒▒▒▒▒▒▒▒▒] ENCRYPTED',
      progress: 0,
      key: 'contact',
      encrypted: true
    }
  ];

  return (
    <div className="file-system">
      <div className="file-header">
        <div>SHAPES:/ $ ls -la</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          STATUS: ACTIVE | LAST_UPDATE: 2025.07.29_15:47:33
        </div>
      </div>
      
      {files.map((file) => (
        <div 
          key={file.key}
          className="file-item" 
          onClick={() => onFileClick(file.key)}
        >
          <div>
            <span className={`file-name ${file.encrypted ? 'encrypted' : ''}`}>
              {file.name}
            </span>
          </div>
          <div className={`file-status ${file.encrypted ? 'encrypted' : ''}`}>
            {file.status}
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileSystem;