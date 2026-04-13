export function ArchDiagram() {
  return (
    <div className="arch-diagram">
      <div className="arch-row">
        <div className="arch-node arch-browser">Browser</div>
      </div>
      <div className="arch-arrow">&darr;</div>
      <div className="arch-row">
        <div className="arch-node arch-edge">Cloudflare Edge (330+ cities)</div>
      </div>
      <div className="arch-arrow">&darr;</div>
      <div className="arch-row arch-middleware">
        <div className="arch-chip">Security</div>
        <div className="arch-chip">Auth</div>
        <div className="arch-chip">CORS</div>
        <div className="arch-chip">ETag</div>
        <div className="arch-chip">Rate Limit</div>
      </div>
      <div className="arch-arrow">&darr;</div>
      <div className="arch-row">
        <div className="arch-node arch-worker">Hono Workers API</div>
      </div>
      <div className="arch-arrow-split">
        <span>&swarr;</span>
        <span>&darr;</span>
        <span>&searr;</span>
      </div>
      <div className="arch-row arch-services">
        <div className="arch-service">
          <div className="arch-service-icon">D1</div>
          <span>SQLite DB</span>
        </div>
        <div className="arch-service">
          <div className="arch-service-icon">KV</div>
          <span>Cache</span>
        </div>
        <div className="arch-service">
          <div className="arch-service-icon">R2</div>
          <span>Storage</span>
        </div>
        <div className="arch-service">
          <div className="arch-service-icon">AI</div>
          <span>Workers AI</span>
        </div>
        <div className="arch-service">
          <div className="arch-service-icon">DO</div>
          <span>Realtime</span>
        </div>
      </div>
      <div className="arch-arrow">&darr;</div>
      <div className="arch-row arch-frontends">
        <div className="arch-frontend">
          <strong>octoworkers.com</strong>
          <span>Landing</span>
        </div>
        <div className="arch-frontend">
          <strong>admin.*</strong>
          <span>Admin Console</span>
        </div>
        <div className="arch-frontend">
          <strong>app.*</strong>
          <span>SaaS CMS</span>
        </div>
      </div>
    </div>
  )
}
