
// src/connect-app-init.js
import { AmazonConnectApp } from '@amazon-connect/app';
import { AgentClient }     from '@amazon-connect/contact';

console.log('✅ Entry file loaded');  // side-effect anchor: should appear in final bundle

// --- helpers for safe UI updates and subscription management ---
function setAppText(text) {
  const el = document.getElementById('app');
  if (el) el.textContent = text;
}

// Keep a single handler reference so we can unsubscribe later
let agentStateChangeHandler = null;
let isSubscribedToAgentState = false;

// Initialize the secure bridge (must run inside Agent Workspace)
const { provider } = AmazonConnectApp.init({
  onCreate: async (event) => {
    const appInstanceId = event?.context?.appInstanceId;
    console.log('✅ App initialized. appInstanceId=', appInstanceId);

    try {
      const agentClient = new AgentClient();

      // Show initial agent info in the UI
      const [name, state] = await Promise.all([
        agentClient.getName(),
        agentClient.getState(),
      ]);
      console.table({ name, state });
      setAppText(`Agent: ${name} · Status: ${state?.name ?? state}`);

      // Prepare our handler (stable reference to unsubscribe later)
      agentStateChangeHandler = ({ state }) => {
        const statusName = state?.name ?? state;
        console.log('🔄 Agent state changed:', state);
        setAppText(`Agent: ${name} · Status: ${statusName}`);
      };

      // Subscribe once — prefer AgentClient, fall back to provider topic
      if (!isSubscribedToAgentState && agentStateChangeHandler) {
        try {
          // Preferred: convenience API
          agentClient.onStateChanged(agentStateChangeHandler);
          isSubscribedToAgentState = true;
          console.log('📌 Subscribed via AgentClient.onStateChanged');
        } catch (e) {
          console.warn('AgentClient.onStateChanged not available; falling back to provider.subscribe', e);
          // Fallback: provider-level topic
          provider.subscribe({ key: 'agent/stateChange' }, agentStateChangeHandler);
          isSubscribedToAgentState = true;
          console.log('📌 Subscribed via provider.subscribe({ key: "agent/stateChange" })');
        }
      }
    } catch (err) {
      console.error('Failed to initialize agent status watch:', err);
      setAppText('Initialization error. See console.');
    }
  },

  onDestroy: () => {
    console.log('🧹 App being destroyed');
    // Unsubscribe safely
    if (isSubscribedToAgentState && agentStateChangeHandler) {
      try {
        const agentClient = new AgentClient();
        // Try both paths; whichever was used will succeed, the other will no-op
        agentClient.offStateChanged?.(agentStateChangeHandler);
        provider.unsubscribe?.({ key: 'agent/stateChange' }, agentStateChangeHandler);
      } catch (e) {
        console.warn('Unsubscribe encountered an issue (continuing):', e);
      } finally {
        isSubscribedToAgentState = false;
        agentStateChangeHandler = null;
      }
    }
  },
});

// Keep your existing “post-init” demo: it’s useful for initial console output
(async () => {
  try {
    const agentClient = new AgentClient();
    const [name, state] = await Promise.all([
      agentClient.getName(),
      agentClient.getState(),
    ]);
    console.table({ name, state });
  } catch (err) {
    console.error('AgentClient failed:', err);
  }
})();
