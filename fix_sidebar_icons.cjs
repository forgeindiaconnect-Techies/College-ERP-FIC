const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.jsx', 'utf8');

const newRender = `            {menuGroups.map((group, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>
                <div className="nav-group-header" onClick={() => toggleGroup(group.name)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '8px', background: group.bg, color: group.color, flexShrink: 0, transition: 'all 0.2s ease' }}>
                      {group.icon}
                    </span>
                    <span>{group.name}</span>
                  </div>
                  {expandedGroups[group.name] ? <ChevronDown size={15} style={{ color: group.color }} /> : <ChevronRight size={15} style={{ color: '#94a3b8' }} />}
                </div>
                <ul className={\`nav-group-items \${expandedGroups[group.name] ? 'expanded' : 'collapsed'}\`}>
                  {group.items.map((item, i) => (
                    <li key={i}>
                      <NavLink to={item.path} end={item.exact} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} style={{ paddingLeft: '1rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', background: group.bg, color: group.color, flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}`;

const regex = /\{menuGroups\.map\(\(group, idx\)[\s\S]*?\)\)\}/;
if (regex.test(code)) {
  code = code.replace(regex, newRender);
  fs.writeFileSync('src/components/layout/Sidebar.jsx', code, 'utf8');
  console.log('Done - sidebar icons updated');
} else {
  console.log('No match - check file manually');
}
