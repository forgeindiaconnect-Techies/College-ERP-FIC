const fs = require('fs');
const staffPath = 'src/staff/pages/StaffDashboard.jsx';
let staffContent = fs.readFileSync(staffPath, 'utf8');

// The replacement mapping
const replacements = [
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon blue">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  },
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon emerald">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  },
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon indigo">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  },
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon amber">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  },
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon red">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  },
  {
    target: '<div className="staff-stat-card">\n          <div className="staff-stat-icon purple">',
    replacement: '<div className="staff-stat-card bg-[#ffffff] border border-[#e5e7eb]">\n          <div className="staff-stat-icon bg-[#EEEDFE] text-[#3C3489]">'
  }
];

replacements.forEach(rep => {
  staffContent = staffContent.replace(rep.target, rep.replacement);
});

fs.writeFileSync(staffPath, staffContent, 'utf8');
console.log('Fixed StaffDashboard.jsx icon chips');
