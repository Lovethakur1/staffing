import svgPaths from "./svg-tn9tvehyme";
import clsx from "clsx";
type Container91Props = {
  additionalClassNames?: string;
};

function Container91({ children, additionalClassNames = "" }: React.PropsWithChildren<Container91Props>) {
  return (
    <div className={clsx("h-[35px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">{children}</div>
    </div>
  );
}
type Container90Props = {
  additionalClassNames?: string;
};

function Container90({ children, additionalClassNames = "" }: React.PropsWithChildren<Container90Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[2px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Container89Props = {
  additionalClassNames?: string;
};

function Container89({ children, additionalClassNames = "" }: React.PropsWithChildren<Container89Props>) {
  return (
    <div className={clsx("absolute h-[600px] rounded-[12px] top-0", additionalClassNames)}>
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type PrimitiveSpanProps = {
  text: string;
};

function PrimitiveSpan({ children, text }: React.PropsWithChildren<PrimitiveSpanProps>) {
  return (
    <div className="absolute bg-[#f1f5f9] left-0 rounded-[3.35544e+07px] size-[40px] top-0">
      <div className="content-stretch flex items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <div className="basis-0 bg-[#f1f5f9] grow h-[38px] min-h-px min-w-px relative rounded-[3.35544e+07px] shrink-0">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
            <p className="font-['Arial:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#45556c] text-[14px] text-nowrap">{text}</p>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[3.35544e+07px]" />
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center size-full">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center px-[9px] py-[5px] relative size-full">{children}</div>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-[#eef2ff] relative rounded-[3.35544e+07px] shrink-0 size-[32px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">{children}</div>
    </div>
  );
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center size-full">
      <div className="content-stretch flex items-center justify-between px-[13px] py-px relative size-full">{children}</div>
    </div>
  );
}

function Icon13({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[16px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">{children}</g>
      </svg>
    </div>
  );
}

function Container88({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[66px] relative rounded-[12px] shrink-0 w-full">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Wrapper>{children}</Wrapper>
    </div>
  );
}
type ContainerText1Props = {
  text: string;
};

function ContainerText1({ text }: ContainerText1Props) {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#45556c] text-[14px]">{text}</p>
    </div>
  );
}
type ContainerTextProps = {
  text: string;
};

function ContainerText({ text }: ContainerTextProps) {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full">
      <p className="font-['Arial:Bold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#0f172b] text-[10px] text-nowrap tracking-[0.25px] uppercase">{text}</p>
    </div>
  );
}
type ParagraphText4Props = {
  text: string;
};

function ParagraphText4({ text }: ParagraphText4Props) {
  return (
    <div className="h-[12.5px] relative shrink-0 w-full">
      <p className="absolute font-['Arial:Regular',sans-serif] leading-[12.5px] left-0 not-italic text-[#62748e] text-[10px] text-nowrap top-[-2px]">{text}</p>
    </div>
  );
}
type TextText1Props = {
  text: string;
};

function TextText1({ text }: TextText1Props) {
  return (
    <div className="bg-white h-[25px] relative rounded-[6px] shrink-0 w-[63.844px]">
      <div aria-hidden="true" className="absolute border border-[#bedbff] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[11px] py-[5px] relative size-full">
        <p className="font-['Arial:Bold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#155dfc] text-[10px] text-nowrap">{text}</p>
      </div>
    </div>
  );
}
type ParagraphText3Props = {
  text: string;
};

function ParagraphText3({ text }: ParagraphText3Props) {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full">
      <p className="font-['Arial:Regular',sans-serif] leading-[16px] not-italic relative shrink-0 text-[#62748e] text-[12px] text-nowrap">{text}</p>
    </div>
  );
}
type ParagraphText2Props = {
  text: string;
};

function ParagraphText2({ text }: ParagraphText2Props) {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full">
      <p className="basis-0 font-['Arial:Bold',sans-serif] grow leading-[20px] min-h-px min-w-px not-italic relative shrink-0 text-[#1d293d] text-[14px]">{text}</p>
    </div>
  );
}
type TextTextProps = {
  text: string;
};

function TextText({ text }: TextTextProps) {
  return (
    <div className="bg-white h-[25px] relative rounded-[6px] shrink-0 w-[56.797px]">
      <div aria-hidden="true" className="absolute border border-[#b9f8cf] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start px-[11px] py-[5px] relative size-full">
        <p className="font-['Arial:Bold',sans-serif] leading-[15px] not-italic relative shrink-0 text-[#00a63e] text-[10px] text-nowrap">{text}</p>
      </div>
    </div>
  );
}
type ParagraphText1Props = {
  text: string;
};

function ParagraphText1({ text }: ParagraphText1Props) {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-full">
      <p className="font-['Arial:Bold',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#1d293d] text-[14px] text-nowrap">{text}</p>
    </div>
  );
}
type ParagraphTextProps = {
  text: string;
};

function ParagraphText({ text }: ParagraphTextProps) {
  return (
    <div className="content-stretch flex h-[16px] items-start relative shrink-0 w-full">
      <p className="basis-0 font-['Arial:Regular',sans-serif] grow leading-[16px] min-h-px min-w-px not-italic relative shrink-0 text-[#62748e] text-[12px]">{text}</p>
    </div>
  );
}
type PrimitiveButtonTextProps = {
  text: string;
};

function PrimitiveButtonText({ text }: PrimitiveButtonTextProps) {
  return (
    <div className="basis-0 grow h-[29px] min-h-px min-w-px relative rounded-[12px] shrink-0">
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Wrapper2>
        <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#64748b] text-[14px] text-center text-nowrap">{text}</p>
      </Wrapper2>
    </div>
  );
}

function PrimitiveButton() {
  return (
    <div className="basis-0 bg-[rgba(226,232,240,0.3)] grow h-[29px] min-h-px min-w-px relative rounded-[12px] shrink-0" data-name="Primitive.button">
      <div aria-hidden="true" className="absolute border border-[#e2e8f0] border-solid inset-0 pointer-events-none rounded-[12px]" />
      <Wrapper2>
        <p className="font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#1a1a1a] text-[14px] text-center text-nowrap">Live Tracking</p>
      </Wrapper2>
    </div>
  );
}

function PrimitiveDiv() {
  return (
    <div className="bg-[#f1f5f9] content-stretch flex h-[36px] items-center justify-center overflow-clip relative rounded-[12px] shrink-0 w-full" data-name="Primitive.div">
      <PrimitiveButton />
      <PrimitiveButtonText text="Staff Roster" />
      <PrimitiveButtonText text="Attendance" />
      <PrimitiveButtonText text="Performance" />
      <PrimitiveButtonText text="Issues" />
    </div>
  );
}

function TabsList() {
  return (
    <div className="h-[36px] relative shrink-0 w-[1327px]" data-name="TabsList">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip pl-0 pr-[884.078px] py-0 relative rounded-[inherit] size-full">
        <PrimitiveDiv />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-0 size-[20px] top-[4px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g id="Icon">
          <path d={svgPaths.p2f5eb900} id="Vector" stroke="var(--stroke-0, #5E1916)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p25397b80} id="Vector_2" stroke="var(--stroke-0, #5E1916)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
          <path d={svgPaths.p2c4f400} id="Vector_3" stroke="var(--stroke-0, #5E1916)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" />
        </g>
      </svg>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 3">
      <Icon />
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[28px] left-[28px] not-italic text-[#1d293d] text-[18px] text-nowrap top-[-1px]">Staff Locations</p>
    </div>
  );
}

function Container() {
  return (
    <div className="h-[89px] relative shrink-0 w-[424.328px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-start pb-px pt-[20px] px-[20px] relative size-full">
        <Heading />
        <ParagraphText text="Select staff member to track real-time location" />
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[101px]" data-name="Container">
      <ParagraphText1 text="Emma Williams" />
      <ParagraphText text="Event Server" />
    </div>
  );
}

function Text() {
  return <div className="absolute bg-[#00c950] border-2 border-solid border-white left-[32px] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container2() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="EW" />
      <Text />
    </div>
  );
}

function Container3() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[157px]">
      <Container1 />
      <Container2 />
    </Wrapper3>
  );
}

function Container4() {
  return (
    <div className="bg-[rgba(239,246,255,0.5)] h-[66px] relative rounded-[12px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#2b7fff] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_0px_0px_1px_rgba(43,127,255,0.2),0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Wrapper>
        <Container3 />
        <TextText text="Arrived" />
      </Wrapper>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[111.094px]" data-name="Container">
      <ParagraphText1 text="James Rodriguez" />
      <ParagraphText text="Bartender" />
    </div>
  );
}

function Text1() {
  return <div className="absolute bg-[#00c950] border-2 border-solid border-white left-[32px] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container6() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="JR" />
      <Text1 />
    </div>
  );
}

function Container7() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[167.094px]">
      <Container5 />
      <Container6 />
    </Wrapper3>
  );
}

function Container8() {
  return (
    <Container88>
      <Container7 />
      <TextText text="Arrived" />
    </Container88>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[98.141px]" data-name="Container">
      <ParagraphText2 text="Maria Garcia" />
      <ParagraphText3 text="Catering Manager" />
    </div>
  );
}

function Text2() {
  return <div className="absolute bg-[#00c950] border-2 border-solid border-white left-[32px] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container10() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="MG" />
      <Text2 />
    </div>
  );
}

function Container11() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[154.141px]">
      <Container9 />
      <Container10 />
    </Wrapper3>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[9px] size-[12px] top-[5px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_8007_2391)" id="Icon">
          <path d="M6 3V6L8 7" id="Vector" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p3e7757b0} id="Vector_2" stroke="var(--stroke-0, #CA3500)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_8007_2391">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Badge() {
  return (
    <div className="bg-[#ffedd4] h-[22px] relative rounded-[6px] shrink-0 w-[60.781px]" data-name="Badge">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid overflow-clip relative rounded-[inherit] size-full">
        <Icon1 />
        <p className="absolute font-['Arial:Regular',sans-serif] leading-[16px] left-[29px] not-italic text-[#ca3500] text-[12px] text-nowrap top-[2px]">Late</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0)] border-solid inset-0 pointer-events-none rounded-[6px]" />
    </div>
  );
}

function Container12() {
  return (
    <Container88>
      <Container11 />
      <Badge />
    </Container88>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[67.859px]" data-name="Container">
      <ParagraphText1 text="David Kim" />
      <ParagraphText3 text="Event Server" />
    </div>
  );
}

function Text3() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container14() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="DK" />
      <Text3 />
    </div>
  );
}

function Container15() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[123.859px]">
      <Container13 />
      <Container14 />
    </Wrapper3>
  );
}

function Container16() {
  return (
    <Container88>
      <Container15 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container17() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[91.625px]" data-name="Container">
      <ParagraphText1 text="Sophie Brown" />
      <ParagraphText text="Bartender" />
    </div>
  );
}

function Text4() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container18() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="SB" />
      <Text4 />
    </div>
  );
}

function Container19() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[147.625px]">
      <Container17 />
      <Container18 />
    </Wrapper3>
  );
}

function Container20() {
  return (
    <Container88>
      <Container19 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[98.141px]" data-name="Container">
      <ParagraphText2 text="Michael Chen" />
      <ParagraphText3 text="Catering Manager" />
    </div>
  );
}

function Text5() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container22() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="MC" />
      <Text5 />
    </div>
  );
}

function Container23() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[154.141px]">
      <Container21 />
      <Container22 />
    </Wrapper3>
  );
}

function Container24() {
  return (
    <Container88>
      <Container23 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[112.828px]" data-name="Container">
      <ParagraphText1 text="Isabella Martinez" />
      <ParagraphText text="Event Server" />
    </div>
  );
}

function Text6() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container26() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="IM" />
      <Text6 />
    </div>
  );
}

function Container27() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[168.828px]">
      <Container25 />
      <Container26 />
    </Wrapper3>
  );
}

function Container28() {
  return (
    <Container88>
      <Container27 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[90.984px]" data-name="Container">
      <ParagraphText1 text="Tyler Johnson" />
      <ParagraphText text="Bartender" />
    </div>
  );
}

function Text7() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container30() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="TJ" />
      <Text7 />
    </div>
  );
}

function Container31() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[146.984px]">
      <Container29 />
      <Container30 />
    </Wrapper3>
  );
}

function Container32() {
  return (
    <Container88>
      <Container31 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[111.422px]" data-name="Container">
      <ParagraphText1 text="Olivia Thompson" />
      <ParagraphText text="Catering Manager" />
    </div>
  );
}

function Text8() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container34() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="OT" />
      <Text8 />
    </div>
  );
}

function Container35() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[167.422px]">
      <Container33 />
      <Container34 />
    </Wrapper3>
  );
}

function Container36() {
  return (
    <Container88>
      <Container35 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container37() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[106.391px]" data-name="Container">
      <ParagraphText1 text="Alexander Davis" />
      <ParagraphText text="Event Server" />
    </div>
  );
}

function Text9() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container38() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="AD" />
      <Text9 />
    </div>
  );
}

function Container39() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[162.391px]">
      <Container37 />
      <Container38 />
    </Wrapper3>
  );
}

function Container40() {
  return (
    <Container88>
      <Container39 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container41() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[92.453px]" data-name="Container">
      <ParagraphText1 text="Rachel Wilson" />
      <ParagraphText text="Bartender" />
    </div>
  );
}

function Text10() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container42() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="RW" />
      <Text10 />
    </div>
  );
}

function Container43() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[148.453px]">
      <Container41 />
      <Container42 />
    </Wrapper3>
  );
}

function Container44() {
  return (
    <Container88>
      <Container43 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex flex-col h-[36px] items-start left-[56px] top-[2px] w-[98.141px]" data-name="Container">
      <ParagraphText2 text="Daniel Moore" />
      <ParagraphText3 text="Catering Manager" />
    </div>
  );
}

function Text11() {
  return <div className="absolute bg-[#2b7fff] border-2 border-solid border-white left-[32px] opacity-[0.568] rounded-[3.35544e+07px] size-[12px] top-[28px]" data-name="Text" />;
}

function Container46() {
  return (
    <div className="absolute left-0 size-[40px] top-0" data-name="Container">
      <PrimitiveSpan text="DM" />
      <Text11 />
    </div>
  );
}

function Container47() {
  return (
    <Wrapper3 additionalClassNames="h-[40px] w-[154.141px]">
      <Container45 />
      <Container46 />
    </Wrapper3>
  );
}

function Container48() {
  return (
    <Container88>
      <Container47 />
      <TextText1 text="En Route" />
    </Container88>
  );
}

function Container49() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[424.328px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip pb-0 pl-[16px] pr-[22px] pt-[16px] relative rounded-[inherit] size-full">
        <Container4 />
        <Container8 />
        <Container12 />
        <Container16 />
        <Container20 />
        <Container24 />
        <Container28 />
        <Container32 />
        <Container36 />
        <Container40 />
        <Container44 />
        <Container48 />
      </div>
    </div>
  );
}

function Container50() {
  return (
    <Container89 additionalClassNames="bg-white left-0 w-[426.328px]">
      <Container />
      <Container49 />
    </Container89>
  );
}

function Container51() {
  return <div className="absolute h-[528px] left-0 top-0 w-[872.672px]" data-name="Container" />;
}

function Icon2() {
  return (
    <Icon13>
      <path d={svgPaths.p12ab1a00} id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p93427c0} id="Vector_2" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 14.6667V8" id="Vector_3" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container52() {
  return (
    <Wrapper1>
      <Icon2 />
    </Wrapper1>
  );
}

function Paragraph() {
  return (
    <div className="h-[15px] overflow-clip relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#0f172b] text-[12px] top-[-2px] w-[171px]">Downtown Convention Center</p>
    </div>
  );
}

function Container53() {
  return (
    <Container90 additionalClassNames="h-[30px] w-[133px]">
      <Paragraph />
      <ParagraphText4 text="3 Sadova St." />
    </Container90>
  );
}

function Container54() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[12px] h-[54px] items-center left-0 pl-[11px] pr-px py-px rounded-[12px] top-[8px] w-[192px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
      <Container52 />
      <Container53 />
    </div>
  );
}

function Container55() {
  return <div className="absolute bg-[#4f39f6] h-[32px] left-[140px] top-[-32px] w-[2px]" data-name="Container" />;
}

function Container56() {
  return (
    <div className="absolute h-[62px] left-[597.67px] top-[414px] w-[192px]" data-name="Container">
      <Container54 />
      <Container55 />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute h-[528px] left-0 top-0 w-[872.672px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 872.672 528">
        <g id="Icon">
          <path d={svgPaths.p23279200} id="Vector" stroke="url(#paint0_linear_8007_2431)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6.54504" />
          <path d={svgPaths.p492c9f0} fill="var(--fill-0, white)" id="Vector_2" stroke="var(--stroke-0, #4338CA)" strokeWidth="3.27252" />
          <path d={svgPaths.p2a3b3000} fill="var(--fill-0, white)" id="Vector_3" stroke="var(--stroke-0, #4338CA)" strokeWidth="3.27252" />
          <path d={svgPaths.p2196f0c0} fill="var(--fill-0, white)" id="Vector_4" stroke="var(--stroke-0, #4338CA)" strokeWidth="3.27252" />
          <path d={svgPaths.p77b2a00} fill="var(--fill-0, #4338CA)" id="Vector_5" stroke="var(--stroke-0, white)" strokeWidth="2.18168" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_8007_2431" x1="218.166" x2="29634.1" y1="100.375" y2="47165.8">
            <stop stopColor="#4338CA" stopOpacity="0.8" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <Icon13>
      <path d={svgPaths.p264a0480} id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10 12H6" id="Vector_2" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p37bb0d00} id="Vector_3" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p1c171d80} id="Vector_4" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p48c6d00} id="Vector_5" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container57() {
  return (
    <Wrapper1>
      <Icon4 />
    </Wrapper1>
  );
}

function Paragraph1() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Arial:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#0f172b] text-[12px] text-nowrap top-[-2px]">Kyiv, 01001</p>
    </div>
  );
}

function Container58() {
  return (
    <Container90 additionalClassNames="h-[29.5px] w-[85.453px]">
      <Paragraph1 />
      <ParagraphText4 text="24 Khreshchatyk St." />
    </Container90>
  );
}

function Container59() {
  return (
    <div className="absolute bg-white content-stretch flex gap-[12px] h-[54px] items-center left-0 pl-[11px] pr-px py-px rounded-[12px] top-0 w-[160px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)]" />
      <Container57 />
      <Container58 />
    </div>
  );
}

function Container60() {
  return <div className="absolute bg-[#4f39f6] h-[48px] left-[29px] top-[54px] w-[2px]" data-name="Container" />;
}

function Container61() {
  return <div className="absolute bg-[#4f39f6] border-2 border-solid border-white left-[24px] rounded-[3.35544e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] size-[12px] top-[92px]" data-name="Container" />;
}

function Container62() {
  return (
    <div className="absolute h-[54px] left-[162.67px] top-[36px] w-[160px]" data-name="Container">
      <Container59 />
      <Container60 />
      <Container61 />
    </div>
  );
}

function Container63() {
  return <div className="absolute bg-[rgba(97,95,255,0.2)] left-[-88px] opacity-0 rounded-[3.35544e+07px] size-[224px] top-[-88px]" data-name="Container" />;
}

function Container64() {
  return <div className="absolute bg-[rgba(97,95,255,0.3)] left-[-16px] rounded-[3.35544e+07px] size-[80px] top-[-16px]" data-name="Container" />;
}

function Icon5() {
  return (
    <div className="relative size-[28.284px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28.2842 28.2842">
        <g id="Icon">
          <path d={svgPaths.p19d2180} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.35701" />
        </g>
      </svg>
    </div>
  );
}

function Container65() {
  return (
    <div className="absolute bg-[#4f39f6] content-stretch flex items-center justify-center left-0 pl-[3px] pr-[5px] py-[3px] rounded-[3.35544e+07px] size-[48px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3px] border-solid border-white inset-0 pointer-events-none rounded-[3.35544e+07px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]" />
      <div className="flex items-center justify-center relative shrink-0 size-[40px]" style={{ "--transform-inner-width": "300", "--transform-inner-height": "150" } as React.CSSProperties}>
        <div className="flex-none rotate-[45deg]">
          <Icon5 />
        </div>
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute left-[442.67px] size-[48px] top-[268px]" data-name="Container">
      <Container63 />
      <Container64 />
      <Container65 />
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute h-[528px] left-0 top-0 w-[872.672px]" data-name="Container">
      <Container51 />
      <Container56 />
      <Icon3 />
      <Container62 />
      <Container66 />
    </div>
  );
}

function Icon6() {
  return (
    <Icon13>
      <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M8 3.33333V12.6667" id="Vector_2" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Button() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-[0px_0px_1px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pb-px pt-0 px-0 relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <Icon13>
      <path d="M3.33333 8H12.6667" id="Vector" stroke="var(--stroke-0, #45556C)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Button1() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[32px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Container68() {
  return (
    <div className="basis-0 bg-white grow min-h-px min-w-px relative rounded-[8px] shrink-0 w-[34px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Button />
        <Button1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Icon8() {
  return (
    <Icon13>
      <path d={svgPaths.p1bd16b80} fill="var(--fill-0, #0F172B)" id="Vector" stroke="var(--stroke-0, #0F172B)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Button2() {
  return (
    <div className="bg-white relative rounded-[8px] shrink-0 size-[32px]" data-name="Button">
      <div aria-hidden="true" className="absolute border border-[#f1f5f9] border-solid inset-0 pointer-events-none rounded-[8px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-px relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[106px] items-start left-[822.67px] top-[16px] w-[34px]" data-name="Container">
      <Container68 />
      <Button2 />
    </div>
  );
}

function Container70() {
  return (
    <div className="absolute bg-[#f1f5f9] h-[528px] left-0 overflow-clip top-0 w-[872.672px]" data-name="Container">
      <Container67 />
      <Container69 />
    </div>
  );
}

function Icon9() {
  return (
    <Icon13>
      <path d={svgPaths.p1bd16b80} id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container71() {
  return (
    <Wrapper1>
      <Icon9 />
    </Wrapper1>
  );
}

function Container72() {
  return (
    <Container91 additionalClassNames="w-[101.906px]">
      <ContainerText text="Current location" />
      <ContainerText1 text="Rivno, 33004" />
    </Container91>
  );
}

function Container73() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[35px] items-start left-0 top-0 w-[186.156px]" data-name="Container">
      <Container71 />
      <Container72 />
    </div>
  );
}

function Icon10() {
  return (
    <Icon13>
      <path d="M8 9.33333L10.6667 6.66667" id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d={svgPaths.p7287c80} id="Vector_2" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container74() {
  return (
    <Wrapper1>
      <Icon10 />
    </Wrapper1>
  );
}

function Container75() {
  return (
    <div className="content-stretch flex h-[15px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="basis-0 font-['Arial:Bold',sans-serif] grow leading-[15px] min-h-px min-w-px not-italic relative shrink-0 text-[#0f172b] text-[10px] tracking-[0.25px] uppercase">Speed</p>
    </div>
  );
}

function Container76() {
  return (
    <Container91 additionalClassNames="w-[58.313px]">
      <Container75 />
      <ContainerText1 text="60 km/hr" />
    </Container91>
  );
}

function Container77() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[35px] items-start left-[218.16px] top-0 w-[186.172px]" data-name="Container">
      <Container74 />
      <Container76 />
    </div>
  );
}

function Icon11() {
  return (
    <Icon13>
      <path d={svgPaths.p260a9400} id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M10 3.84265V13.8427" id="Vector_2" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M6 2.15735V12.1573" id="Vector_3" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container78() {
  return (
    <Wrapper1>
      <Icon11 />
    </Wrapper1>
  );
}

function Container79() {
  return (
    <Container91 additionalClassNames="w-[88.531px]">
      <ContainerText text="Kilometers left" />
      <ContainerText1 text="123 km" />
    </Container91>
  );
}

function Container80() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[35px] items-start left-[436.33px] top-0 w-[186.172px]" data-name="Container">
      <Container78 />
      <Container79 />
    </div>
  );
}

function Icon12() {
  return (
    <Icon13>
      <path d={svgPaths.p12949080} id="Vector" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
      <path d="M2 2V5.33333H5.33333" id="Vector_2" stroke="var(--stroke-0, #4F39F6)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
    </Icon13>
  );
}

function Container81() {
  return (
    <Wrapper1>
      <Icon12 />
    </Wrapper1>
  );
}

function Container82() {
  return (
    <Container91 additionalClassNames="w-[53.656px]">
      <ContainerText text="Last stop" />
      <ContainerText1 text="Arrived" />
    </Container91>
  );
}

function Container83() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[35px] items-start left-[654.5px] top-0 w-[186.172px]" data-name="Container">
      <Container81 />
      <Container82 />
    </div>
  );
}

function Container84() {
  return (
    <div className="h-[35px] relative shrink-0 w-full" data-name="Container">
      <Container73 />
      <Container77 />
      <Container80 />
      <Container83 />
    </div>
  );
}

function Container85() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[68px] items-start left-0 pb-0 pt-[17px] px-[16px] top-[528px] w-[872.672px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-[1px_0px_0px] border-solid inset-0 pointer-events-none shadow-[0px_-5px_20px_0px_rgba(0,0,0,0.05)]" />
      <Container84 />
    </div>
  );
}

function LiveTrackingMap() {
  return (
    <div className="absolute bg-[#f8fafc] border border-[#e2e8f0] border-solid h-[598px] left-0 overflow-clip rounded-[12px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] top-0 w-[874.672px]" data-name="LiveTrackingMap">
      <Container70 />
      <Container85 />
    </div>
  );
}

function Container86() {
  return (
    <div className="h-[598px] relative shrink-0 w-full" data-name="Container">
      <LiveTrackingMap />
    </div>
  );
}

function Container87() {
  return (
    <Container89 additionalClassNames="bg-[#0f172b] left-[450.33px] w-[876.672px]">
      <Container86 />
    </Container89>
  );
}

function ManagerEventDetail() {
  return (
    <Wrapper3 additionalClassNames="h-[600px] w-[1327px]">
      <Container50 />
      <Container87 />
    </Wrapper3>
  );
}

export default function PrimitiveDiv1() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] items-start relative size-full" data-name="Primitive.div">
      <TabsList />
      <ManagerEventDetail />
    </div>
  );
}