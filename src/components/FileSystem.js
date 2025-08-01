import React from 'react';
import { getAllFiles, fileSystemHeader } from '../data/fileContent';

const FileSystem = ({ onFileClick }) => {
  const files = getAllFiles();

  return (
    <div className="file-system">
      <div className="file-header">
        <div>{fileSystemHeader.command}</div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          {fileSystemHeader.status}
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