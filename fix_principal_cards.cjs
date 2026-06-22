const fs = require('fs');
const file = 'src/principal/pages/PrincipalDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

const getInitialsCode = "{user.name ? (user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length >= 2 ? user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[0][0] + user.name.split(' ').filter(p => p.length > 0 && !p.includes('.'))[user.name.split(' ').filter(p => p.length > 0 && !p.includes('.')).length - 1][0] : user.name.replace(/[^a-zA-Z]/g, '').substring(0, 2)).toUpperCase() : 'U'}";

const generateCard = (role, idField) => `
                        <div key={user._id} style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E3E5EC', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'} onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#EEEDFE', color: '#3C3489', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem', flexShrink: 0 }}>
                                ${getInitialsCode}
                              </div>
                              <div>
                                <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>{user.name}</p>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {user.${idField} || 'N/A'}</p>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#EEEDFE', color: '#3C3489', padding: '4px 10px', borderRadius: '6px' }}>${role}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>✉ {user.email}</p>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>View Profile →</span>
                          </div>
                        </div>`;

content = content.replace(/<div key=\{user\._id\} style=\{\{ background: 'var\(--bg-primary\)', padding: '1rem', borderRadius: '12px', border: '1px solid var\(--border-color\)', borderLeft: '4px solid #3730A5' \}\}>[\s\S]*?<\/div>/, generateCard('HOD', 'referenceId'));
content = content.replace(/<div key=\{user\._id\} style=\{\{ background: 'var\(--bg-primary\)', padding: '1rem', borderRadius: '12px', border: '1px solid var\(--border-color\)', borderLeft: '4px solid #3730A5' \}\}>[\s\S]*?<\/div>/, generateCard('Staff', 'referenceId'));
content = content.replace(/<div key=\{user\._id\} style=\{\{ background: 'var\(--bg-primary\)', padding: '1rem', borderRadius: '12px', border: '1px solid var\(--border-color\)', borderLeft: '4px solid #3730A5' \}\}>[\s\S]*?<\/div>/, generateCard('Student', 'referenceId || user.studentId'));

// Also update the pills for 1 HOD / 1 Staff / 1 Students
content = content.replace(/background: '#EEEDFE', color: '#3C3489'/g, "background: 'rgba(55, 48, 165, 0.1)', color: '#3730A5'");

fs.writeFileSync(file, content);
console.log('Fixed cards in PrincipalDashboard');
