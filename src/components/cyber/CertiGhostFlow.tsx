import React from 'react';
import { UserX, Server, ShieldAlert, ArrowRight, ArrowLeft, Key, Terminal } from 'lucide-react';

export const CertiGhostFlow = () => {
  return (
    <div className="my-8 rounded-xl border border-border bg-card p-6 font-mono shadow-2xl">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="text-red-500 animate-pulse" size={24} />
          <h3 className="text-lg font-bold text-foreground m-0">CertiGhost (CVE-2026-54121) Chase Flow</h3>
        </div>
        <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs text-red-500 uppercase tracking-widest font-semibold">
          Critical Path
        </span>
      </div>

      <div className="flex flex-col space-y-6">
        
        {/* Step 1 & 2 */}
        <div className="flex flex-col space-y-2">
          <Step 
            num={1}
            from="Attacker" 
            fromIcon={<UserX size={14}/>} 
            fromColor="red"
            to="Domain Controller" 
            toIcon={<Server size={14}/>}
            toColor="emerald"
            action="Create machine account"
            dir="right"
          />
          <Step 
            num={2}
            from="Domain Controller" 
            fromIcon={<Server size={14}/>} 
            fromColor="emerald"
            to="Attacker" 
            toIcon={<UserX size={14}/>}
            toColor="red"
            action="Machine account accepted"
            dir="left"
            dashed
          />
        </div>

        <div className="my-2 border-l-2 border-border ml-4 pl-4 py-2 text-xs text-muted-foreground flex items-center gap-2">
          <Terminal size={14} className="text-amber-500" />
          <span>Attacker prepares rogue SMB/LDAP services on their host</span>
        </div>

        {/* Step 3 */}
        <Step 
          num={3}
          from="Attacker" 
          fromIcon={<UserX size={14}/>} 
          fromColor="red"
          to="Enterprise CA" 
          toIcon={<ShieldAlert size={14}/>}
          toColor="amber"
          action="Submit cert request (cdc = attacker, rmd = target dc)"
          dir="right"
        />

        {/* Step 4 & 5 */}
        <div className="flex flex-col space-y-2">
          <Step 
            num={4}
            from="Enterprise CA" 
            fromIcon={<ShieldAlert size={14}/>} 
            fromColor="amber"
            to="Attacker" 
            toIcon={<UserX size={14}/>}
            toColor="red"
            action="Connects over SMB/LSA (Chase Flow trigger)"
            dir="left"
          />
          <Step 
            num={5}
            from="Enterprise CA" 
            fromIcon={<ShieldAlert size={14}/>} 
            fromColor="amber"
            to="Attacker" 
            toIcon={<UserX size={14}/>}
            toColor="red"
            action="LDAP chase for rmd"
            dir="left"
          />
        </div>

        {/* Step 6 - CRITICAL FAILURE */}
        <div className="relative group">
          <div className="absolute inset-0 bg-red-500/5 rounded-lg blur-md group-hover:bg-red-500/10 transition-all"></div>
          <div className="relative border border-red-500/30 rounded-lg p-2 bg-background">
            <Step 
              num={6}
              from="Attacker" 
              fromIcon={<UserX size={14}/>} 
              fromColor="red"
              to="Enterprise CA" 
              toIcon={<ShieldAlert size={14}/>}
              toColor="amber"
              action="Returns DC objectSid + dNSHostName"
              dir="right"
              dashed
            />
            <div className="mt-2 text-center text-[10px] uppercase tracking-widest text-red-500 font-bold">
              [ Trust Boundary Failure: Chase reply treated as trusted ]
            </div>
          </div>
        </div>

        {/* Step 7 */}
        <Step 
          num={7}
          from="Enterprise CA" 
          fromIcon={<ShieldAlert size={14}/>} 
          fromColor="amber"
          to="Attacker" 
          toIcon={<UserX size={14}/>}
          toColor="red"
          action="Issues cert with target DC identity"
          dir="left"
          dashed
        />

        {/* Step 8 & 9 */}
        <div className="flex flex-col space-y-2">
          <Step 
            num={8}
            from="Attacker" 
            fromIcon={<UserX size={14}/>} 
            fromColor="red"
            to="Domain Controller" 
            toIcon={<Server size={14}/>}
            toColor="emerald"
            action="PKINIT using issued cert"
            dir="right"
          />
          <Step 
            num={9}
            from="Domain Controller" 
            fromIcon={<Server size={14}/>} 
            fromColor="emerald"
            to="Attacker" 
            toIcon={<UserX size={14}/>}
            toColor="red"
            action="Authenticates as target DC"
            dir="left"
            dashed
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-3 text-cyan-400">
          <Key size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Result: Attacker Gains DC Replication Access</span>
        </div>
      </div>
    </div>
  );
};

function Step({ num, from, fromIcon, fromColor, to, toIcon, toColor, action, dir, dashed = false }: any) {
  const getColorClasses = (color: string) => {
    switch(color) {
      case 'red': return 'border-red-500/50 bg-red-500/10 text-red-500';
      case 'emerald': return 'border-emerald-500/50 bg-emerald-500/10 text-emerald-500';
      case 'amber': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
      default: return 'border-border bg-muted text-foreground';
    }
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className={`flex items-center gap-1.5 flex-shrink-0 px-2 py-1.5 rounded-md border text-xs font-semibold uppercase tracking-wider w-[180px] justify-center ${getColorClasses(dir === 'right' ? fromColor : toColor)}`}>
        {dir === 'right' ? fromIcon : toIcon}
        <span className="truncate">{dir === 'right' ? from : to}</span>
      </div>

      <div className="relative flex-grow flex items-center justify-center min-w-[200px] h-10">
        <div className={`absolute w-full h-[2px] ${dashed ? 'border-t-2 border-dashed border-muted-foreground/60' : 'bg-muted-foreground/60'}`} />
        
        {dir === 'right' && (
          <ArrowRight className="absolute right-0 text-muted-foreground/60 -mt-[1px]" size={16} />
        )}
        {dir === 'left' && (
          <ArrowLeft className="absolute left-0 text-muted-foreground/60 -mt-[1px]" size={16} />
        )}
        
        <div className="absolute -top-3 bg-card px-2 text-[10px] text-cyan-400/90 font-medium tracking-wide flex items-center gap-1.5 whitespace-nowrap">
          <span className="bg-cyan-500/20 text-cyan-400 rounded-full w-4 h-4 flex items-center justify-center font-bold border border-cyan-500/30">
            {num}
          </span>
          {action}
        </div>
      </div>

      <div className={`flex items-center gap-1.5 flex-shrink-0 px-2 py-1.5 rounded-md border text-xs font-semibold uppercase tracking-wider w-[180px] justify-center ${getColorClasses(dir === 'right' ? toColor : fromColor)}`}>
        {dir === 'right' ? toIcon : fromIcon}
        <span className="truncate">{dir === 'right' ? to : from}</span>
      </div>
    </div>
  );
}
