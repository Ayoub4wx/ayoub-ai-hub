import { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Github, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PROJECTS } from '@/constants/projects'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Explore Ayoub\'s AI and tech projects — from news aggregators to chatbots and community platforms.',
}

export default function ProjectsPage() {
  const featured = PROJECTS.filter((p) => p.featured)
  const others = PROJECTS.filter((p) => !p.featured)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">
          <span className="gradient-text">Projects</span> & Portfolio
        </h1>
        <p className="text-muted-foreground text-lg">AI and tech projects I&apos;ve built</p>
      </div>

      {/* Featured */}
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        Featured Projects
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {featured.map((project) => (
          <Card key={project.id} className="border-border bg-secondary/30 card-hover overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-violet-500 to-cyan-500" />
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-secondary border-border">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button size="sm" className="w-full gap-1.5 bg-violet-600 hover:bg-violet-500 text-white border-0 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </Button>
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                      <Github className="w-3.5 h-3.5" />
                      Code
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {others.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Other Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {others.map((project) => (
              <Card key={project.id} className="border-border bg-secondary/30 card-hover">
                <CardContent className="p-5">
                  <h3 className="font-bold mb-2">{project.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs bg-secondary border-border">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {project.demoUrl && (
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                          <ExternalLink className="w-3.5 h-3.5" />
                          Demo
                        </Button>
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">Want to collaborate or have a project idea?</p>
        <Link href="/contact">
          <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0">
            Get in Touch
          </Button>
        </Link>
      </div>
    </div>
  )
}
