import React, { useState } from "react";

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all shadow-xs"
    >
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="font-medium text-slate-800 truncate">{item.prompt}</h2>
          <p className="text-gray-500 text-xs mt-1">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full shrink-0 text-xs capitalize">
          {item.type}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          {item.type === "image" ? (
            <div>
              <img
                src={item.content}
                alt="image"
                className="w-full max-w-md rounded-md border border-gray-200"
              />
            </div>
          ) : (
            <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {item.content}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;
