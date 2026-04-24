import { useEffect, useRef, useState } from 'react';
import '@elevenlabs/convai-widget-embed';
import avatarImage from './assets/download.jpeg';

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
  avatarImageUrl?: string;
  actionText?: string;
  startCallText?: string;
  endCallText?: string;
  listeningText?: string;
  speakingText?: string;
};

export function ElevenLabsWidget({
  agentId,
  dynamicVariables,
  avatarOrbColor1 = '#4D9CFF',
  avatarOrbColor2 = '#9CE6E6',
  avatarImageUrl = avatarImage,
  actionText,
  startCallText,
  endCallText,
  listeningText,
  speakingText,
}: WidgetProps) {
  const widgetRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    // Imperatively set attributes — React doesn't reliably pass
    // kebab-case attributes to custom HTML elements
    if (actionText) widget.setAttribute('action-text', actionText);
    if (startCallText) widget.setAttribute('start-call-text', startCallText);
    if (endCallText) widget.setAttribute('end-call-text', endCallText);
    if (listeningText) widget.setAttribute('listening-text', listeningText);
    if (speakingText) widget.setAttribute('speaking-text', speakingText);
    if (avatarImageUrl) widget.setAttribute('avatar-image-url', avatarImageUrl);
    if (avatarOrbColor1) widget.setAttribute('avatar-orb-color-1', avatarOrbColor1);
    if (avatarOrbColor2) widget.setAttribute('avatar-orb-color-2', avatarOrbColor2);
    if (dynamicVariables) widget.setAttribute('dynamic-variables', JSON.stringify(dynamicVariables));

    // Listen for call start/end to show/hide mute button
    const handleCallStart = () => setIsCallActive(true);
    const handleCallEnd = () => {
      setIsCallActive(false);
      setIsMuted(false);
    };

    widget.addEventListener('elevenlabs-convai:call', handleCallStart);
    widget.addEventListener('elevenlabs-convai:call_ended', handleCallEnd);

    // Periodically check and modify internal widget DOM
    const widgetDomMonitor = setInterval(() => {
      const roots = [document, widget, widget.shadowRoot].filter(Boolean) as ParentNode[];
      
      roots.forEach(root => {
        // Remove the "Powered by ElevenAgents" badge
        const paragraphs = root.querySelectorAll('p');
        paragraphs.forEach(p => {
          if (p.textContent?.includes('Powered by') && p.textContent?.includes('ElevenAgents')) {
            p.remove();
          }
        });

        // Auto-click the Terms and Conditions 'Accept' button to bypass the popup
        const buttons = root.querySelectorAll('button');
        buttons.forEach(btn => {
          if (btn.textContent === 'Accept' || btn.textContent?.includes('Accept')) {
            btn.click();
          }
        });

        // Dismiss the "How was this conversation?" feedback screen.
        // Look for any close/skip/dismiss button or the containing section and remove it.
        root.querySelectorAll('button').forEach(btn => {
          const label = btn.getAttribute('aria-label') || btn.textContent || '';
          if (
            label.includes('Close') ||
            label.includes('close') ||
            label.includes('Skip') ||
            label.includes('skip') ||
            label.includes('Dismiss') ||
            label.includes('dismiss')
          ) {
            btn.click();
          }
        });
        // Also remove the feedback container if it exists in the DOM
        root.querySelectorAll('*').forEach(el => {
          if (el.textContent?.includes('How was this conversation')) {
            (el as HTMLElement).style.display = 'none';
          }
        });

        // Replace default widget text labels by targeting bare text nodes only.
        // Using TreeWalker avoids accidentally matching parent divs that contain
        // child elements like the avatar image, which would be wiped by textContent=
        const replaceTextNode = (root: ParentNode, from: string, to: string) => {
          const walker = document.createTreeWalker(
            root as Node,
            NodeFilter.SHOW_TEXT,
            { acceptNode: (node) => node.textContent?.trim() === from ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT }
          );
          const matches: Text[] = [];
          let node: Node | null;
          while ((node = walker.nextNode())) matches.push(node as Text);
          matches.forEach(n => { n.textContent = to; });
        };

        if (actionText) replaceTextNode(root as ParentNode, 'Need help?', actionText);
        if (startCallText) replaceTextNode(root as ParentNode, 'Start a call', startCallText);
        if (endCallText) replaceTextNode(root as ParentNode, 'End call', endCallText);
      });
    }, 50);

    return () => {
      widget.removeEventListener('elevenlabs-convai:call', handleCallStart);
      widget.removeEventListener('elevenlabs-convai:call_ended', handleCallEnd);
      clearInterval(widgetDomMonitor);
    };
  }, [actionText, startCallText, endCallText, listeningText, speakingText, avatarImageUrl, avatarOrbColor1, avatarOrbColor2, dynamicVariables]);

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
        avatar-image-url={avatarImageUrl}
        action-text={actionText}
        start-call-text={startCallText}
        end-call-text={endCallText}
        listening-text={listeningText}
        speaking-text={speakingText}
        dynamic-variables={
          dynamicVariables ? JSON.stringify(dynamicVariables) : undefined
        }
      />

      {/* Mute Button - only shown during active call */}
      {isCallActive && (
        <button
          onClick={handleMuteToggle}
          className={`
            mt-2 px-4 py-2 rounded-full text-sm font-medium transition-colors
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
