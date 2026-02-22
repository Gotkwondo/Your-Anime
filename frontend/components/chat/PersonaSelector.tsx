'use client';

import { PersonaType } from '@/types/conversation';
import { PERSONAS } from '@/lib/mock/personas';
import { cn } from '@/lib/utils/cn';

interface PersonaSelectorProps {
  selectedPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
}

export function PersonaSelector({
  selectedPersona,
  onSelect,
}: PersonaSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {PERSONAS.map((persona, index) => (
        <div
          key={persona.id}
          className="cursor-pointer transition-all duration-300 animate-fade-in rounded-xl p-6"
          style={{
            animationDelay: `${index * 100}ms`,
            background: selectedPersona === persona.id
              ? 'rgba(3,247,181,0.06)'
              : 'rgba(255,255,255,0.02)',
            border: selectedPersona === persona.id
              ? '1px solid rgba(3,247,181,0.3)'
              : '1px solid rgba(255,255,255,0.07)',
          }}
          onClick={() => onSelect(persona.id)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {selectedPersona === persona.id && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#03f7b5' }} />
              )}
              <h3
                className="text-lg font-bold transition-all"
                style={{ color: selectedPersona === persona.id ? '#03f7b5' : '#fff' }}
              >
                {persona.name}
              </h3>
            </div>
            <p className="text-sm" style={{ color: '#85868b' }}>
              {persona.description}
            </p>
            <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs italic" style={{ color: '#85868b' }}>
                &ldquo;{persona.exampleMessage}&rdquo;
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
