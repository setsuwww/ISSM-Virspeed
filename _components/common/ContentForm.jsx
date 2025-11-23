function ContentForm({ children }) {
  return (
    <div className="mx-auto bg-white rounded-lg border border-slate-200 shadow-xs">
      {children}
    </div>
  );
}

ContentForm.Header = function Header({ children }) {
  return <div className="border-b border-slate-200 px-6 pt-4 pb-1 rounded-t-lg">{children}</div>;
};

ContentForm.Body = function Body({ children }) {
  return <main className="p-6">{children}</main>;
};

ContentForm.Footer = function Footer({ children }) {
  return <div className="border-t border-slate-200 p-4 flex justify-start bg-slate-50 rounded-b-lg">{children}</div>;
};

export default ContentForm;
