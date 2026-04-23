## Make the following chnages to the project.

1. Create the Widget React Component

2. First, you need to declare the custom HTML element type for TypeScript, then create the component

```tsx
// ElevenLabsWidget.tsx
'use client'; // if using Next.js App Router

import { useEffect, useRef, useState } from 'react';
import '@elevenlabs/convai-widget-embed';

// TypeScript declaration for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'agent-id'?: string;
          'variant'?: 'full' | 'expandable';
          'avatar-orb-color-1'?: string;
          'avatar-orb-color-2'?: string;
          'avatar-image-url'?: string;
          'action-text'?: string;
          'start-call-text'?: string;
          'end-call-text'?: string;
          'listening-text'?: string;
          'speaking-text'?: string;
          'dynamic-variables'?: string;
          'dismissible'?: string;
        },
        HTMLElement
      >;
    }
  }
}

type WidgetProps = {
  agentId: string;
  dynamicVariables?: Record<string, string>;
  avatarOrbColor1?: string;
  avatarOrbColor2?: string;
};

export function ElevenLabsWidget({
  agentId,
  dynamicVariables,
  avatarOrbColor1 = '#4D9CFF',
  avatarOrbColor2 = '#9CE6E6',
}: WidgetProps) {
  const widgetRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    // Listen for call start/end to show/hide mute button
    const handleCallStart = () => setIsCallActive(true);
    const handleCallEnd = () => {
      setIsCallActive(false);
      setIsMuted(false);
    };

    widget.addEventListener('elevenlabs-convai:call', handleCallStart);
    widget.addEventListener('elevenlabs-convai:call_ended', handleCallEnd);

    return () => {
      widget.removeEventListener('elevenlabs-convai:call', handleCallStart);
      widget.removeEventListener('elevenlabs-convai:call_ended', handleCallEnd);
    };
  }, []);

  const handleMuteToggle = () => {
    const widget = widgetRef.current as any;
    if (!widget) return;

    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Use the widget's built-in mute method
    if (newMutedState) {
      widget.mute?.();
    } else {
      widget.unmute?.();
    }
  };

  return (
    <div className="relative">
      {/* ElevenLabs Widget */}
      <elevenlabs-convai
        ref={widgetRef}
        agent-id={agentId}
        variant="full"
        avatar-orb-color-1={avatarOrbColor1}
        avatar-orb-color-2={avatarOrbColor2}
        dynamic-variables={
          dynamicVariables ? JSON.stringify(dynamicVariables) : undefined
        }
      />

      {/* Mute Button - only shown during active call */}
      {isCallActive && (
        <button
          onClick={handleMuteToggle}
          className={`
            mt-2 px-4 py-2 rounded-full font-medium transition-colors
            ${isMuted
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }
          `}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      )}
    </div>
  );
}

```
The Widget as a React Component.

```tsx
// page.tsx or App.tsx
import { ElevenLabsWidget } from './ElevenLabsWidget';

export default function Page() {
  return (
    <div>
      <h1>Support Chat</h1>
      <ElevenLabsWidget
        agentId="your-agent-id"
        dynamicVariables={{
          previous_conversation_summary: 'User asked about order #12345...',
          user_name: 'John Doe',
        }}
        avatarOrbColor1="#4D9CFF"
        avatarOrbColor2="#9CE6E6"
      />
    </div>
  );
}
```

Remove the Custom HTML Element from the project. uSe the built in React Component for the widget.


