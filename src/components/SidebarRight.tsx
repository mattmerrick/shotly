import React from 'react';
import { Info } from 'lucide-react';

export const SidebarRight: React.FC = () => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
              <ul className="text-xs text-gray-700 space-y-1.5">
                <li>• Click text to select and edit</li>
                <li>• Drag text to reposition</li>
                <li>• Click image to resize</li>
                <li>• Use safe zones as guides</li>
                <li>• Export at full resolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
