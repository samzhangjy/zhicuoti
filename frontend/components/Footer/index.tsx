import { Anchor, Container, Group } from '@mantine/core';
import classes from './Footer.module.css';
import { Logo } from '@/components/Logo';

const links = [
  { link: '#', label: '联系我们' },
  { link: '#', label: '关于' },
];

export function Footer() {
  const items = links.map((link) => (
    <Anchor<'a'>
      c="dimmed"
      key={link.label}
      href={link.link}
      onClick={(event) => event.preventDefault()}
      size="sm"
    >
      {link.label}
    </Anchor>
  ));

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Logo size={28} />
        <Group className={classes.links}>{items}</Group>
      </Container>
    </div>
  );
}